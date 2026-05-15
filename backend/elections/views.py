from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from .models import Election, Position, Candidate, VoteRecord
from .serializers import (
    ElectionSerializer, PositionSerializer, CandidateSerializer,
    VoteRecordSerializer, SubmitVoteSerializer
)


class ElectionViewSet(viewsets.ModelViewSet):
    queryset = Election.objects.all().order_by('-start_date')
    serializer_class = ElectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


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

            return Response({'success': 'Vote cast successfully'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Candidate.DoesNotExist:
            return Response({'error': 'Candidate not found'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
