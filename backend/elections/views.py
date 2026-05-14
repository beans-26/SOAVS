from rest_framework import viewsets, permissions
from .models import Election, Position, Candidate
from .serializers import ElectionSerializer, PositionSerializer, CandidateSerializer


class ElectionViewSet(viewsets.ModelViewSet):
    queryset = Election.objects.all().order_by('-start_date')
    serializer_class = ElectionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class PositionViewSet(viewsets.ModelViewSet):
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
