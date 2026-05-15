from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ElectionViewSet, PositionViewSet, CandidateViewSet,
    VoteRecordViewSet, ActiveElectionViewSet, BallotSubmissionView,
    PartylistViewSet, DashboardStatsView
)

from accounts.views import LoginView

router = DefaultRouter()
router.register(r'elections', ElectionViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'votes', VoteRecordViewSet)
router.register(r'active-elections', ActiveElectionViewSet, basename='active-elections')
router.register(r'partylists', PartylistViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('voter/login/', LoginView.as_view(), name='voter-login'),
    path('voter/submit-vote/', BallotSubmissionView.as_view(), name='submit-vote'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
