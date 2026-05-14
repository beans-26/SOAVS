from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ElectionViewSet, PositionViewSet, CandidateViewSet,
    VoteRecordViewSet, ActiveElectionViewSet, BallotSubmissionView
)

router = DefaultRouter()
router.register(r'elections', ElectionViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'votes', VoteRecordViewSet)
router.register(r'active-elections', ActiveElectionViewSet, basename='active-elections')

urlpatterns = [
    path('', include(router.urls)),
    path('voter/submit-vote/', BallotSubmissionView.as_view(), name='submit-vote'),
]
