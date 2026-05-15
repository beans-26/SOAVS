from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from django.db.models import Q, Count
from .models import Election, Position, Candidate, VoteRecord, Partylist
from .serializers import (
    ElectionSerializer, PositionSerializer, CandidateSerializer,
    VoteRecordSerializer, SubmitVoteSerializer, PartylistSerializer
)


class ElectionViewSet(viewsets.ModelViewSet):
    queryset = Election.objects.all().order_by('-start_date')
    serializer_class = ElectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['GET'])
    def results(self, request, pk=None):
        """Return vote tallies for all candidates in this election."""
        election = self.get_object()
        positions = Position.objects.filter(election=election).order_by('hierarchy_order', 'id')

        results_data = []
        for position in positions:
            candidates = Candidate.objects.filter(position=position)
            candidate_results = []
            for candidate in candidates:
                vote_count = VoteRecord.objects.filter(
                    election=election,
                    candidate=candidate
                ).count()
                candidate_results.append({
                    'id': candidate.id,
                    'name': candidate.name,
                    'partylist': candidate.partylist.name if candidate.partylist else None,
                    'photo': candidate.photo.url if candidate.photo else None,
                    'course_and_year': candidate.course_and_year,
                    'votes': vote_count,
                })
            # Sort by vote count descending
            candidate_results.sort(key=lambda x: x['votes'], reverse=True)
            results_data.append({
                'position_id': position.id,
                'position_name': position.name,
                'max_votes_allowed': position.max_votes_allowed,
                'candidates': candidate_results,
            })

        total_voters = VoteRecord.objects.filter(election=election).values('user').distinct().count()

        return Response({
            'election': {
                'id': election.id,
                'title': election.title,
                'status': election.calculated_status,
            },
            'total_voters': total_voters,
            'results': results_data,
        })


class PartylistViewSet(viewsets.ModelViewSet):
    queryset = Partylist.objects.all()
    serializer_class = PartylistSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Partylist.objects.all()
        election_id = self.request.query_params.get('election')
        if election_id is not None:
            queryset = queryset.filter(election_id=election_id)
        return queryset


class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Optionally filter positions by ?election=<id> query param.
        Frontend uses this to load positions for a specific election.
        """
        queryset = Position.objects.all()
        election_id = self.request.query_params.get('election')
        if election_id is not None:
            queryset = queryset.filter(election_id=election_id)
        return queryset


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class VoteRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = VoteRecord.objects.all()
    serializer_class = VoteRecordSerializer
    permission_classes = [permissions.IsAuthenticated]


class ActiveElectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Election.objects.none()
    serializer_class = ElectionSerializer
    permission_classes = []
    authentication_classes = []

    def get_queryset(self):
        return Election.objects.filter(~Q(status='DRAFT')).order_by('-start_date')

    @action(detail=True, methods=['GET'])
    def ballot(self, request, pk=None):
        election = self.get_object()

        # Check if voting is actually allowed
        now = timezone.now()
        if election.calculated_status == 'UPCOMING':
            return Response({'error': 'Voting has not started yet.'}, status=status.HTTP_400_BAD_REQUEST)
        if election.calculated_status == 'COMPLETED':
            return Response({'error': 'Voting has ended for this election.'}, status=status.HTTP_400_BAD_REQUEST)

        positions = Position.objects.filter(election=election)

        data = []
        for pos in positions:
            candidates = Candidate.objects.filter(position=pos)
            pos_data = PositionSerializer(pos).data
            pos_data['candidates'] = CandidateSerializer(candidates, many=True).data
            data.append(pos_data)

        return Response(data)


class BallotSubmissionView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        from django.conf import settings
        import jwt

        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Authentication required. Please log in again.'}, status=status.HTTP_401_UNAUTHORIZED)

        jwt_token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Voting session expired. Please log in again.'}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({'error': 'Invalid session token.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = SubmitVoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        election_id = serializer.validated_data['election_id']
        selections = serializer.validated_data['selections']

        try:
            from accounts.models import User
            now = timezone.now()

            try:
                election = Election.objects.get(id=election_id)
            except Election.DoesNotExist:
                return Response({'error': 'Election not found'}, status=status.HTTP_404_NOT_FOUND)

            if election.status == 'DRAFT':
                return Response({'error': 'This election is not yet published (Draft mode).'}, status=status.HTTP_400_BAD_REQUEST)
            if election.status == 'COMPLETED' or now > election.end_date:
                return Response({'error': 'Voting for this election has already ended.'}, status=status.HTTP_400_BAD_REQUEST)
            if now < election.start_date:
                return Response({'error': f'Voting has not started yet. Starts at {election.start_date.strftime("%Y-%m-%d %H:%M")}'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                user = User.objects.get(id=user_id)

                if VoteRecord.objects.filter(user=user, election=election).exists():
                    return Response({'error': 'Vote already cast'}, status=status.HTTP_403_FORBIDDEN)

                records = []
                for candidate_id in selections:
                    candidate = Candidate.objects.get(id=candidate_id)
                    records.append(VoteRecord(
                        election=election,
                        position=candidate.position,
                        candidate=candidate,
                        user=user
                    ))
                VoteRecord.objects.bulk_create(records)

                # Clear active session after vote
                user.is_active_session = False
                user.save(update_fields=['is_active_session'])

            return Response({'success': 'Vote cast successfully'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from accounts.models import User

        now = timezone.now()

        active_elections = Election.objects.filter(
            ~Q(status='DRAFT'),
            start_date__lte=now,
            end_date__gte=now
        ).count()

        total_candidates = Candidate.objects.count()
        total_voters = User.objects.filter(is_voter=True).count()
        total_votes = VoteRecord.objects.values('user', 'election').distinct().count()

        # Turnout progression - votes over time (last 30 days, grouped by day)
        from datetime import timedelta
        thirty_days_ago = now - timedelta(days=30)
        daily_votes = (
            VoteRecord.objects
            .filter(timestamp__gte=thirty_days_ago)
            .extra(select={'day': "date(timestamp)"})
            .values('day')
            .annotate(count=Count('id', distinct=True))
            .order_by('day')
        )

        turnout_data = [
            {'date': str(entry['day']), 'votes': entry['count']}
            for entry in daily_votes
        ]

        return Response({
            'active_elections': active_elections,
            'total_candidates': total_candidates,
            'total_voters': total_voters,
            'total_votes': total_votes,
            'turnout_progression': turnout_data,
        })
