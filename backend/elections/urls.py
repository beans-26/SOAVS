from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ElectionViewSet, PositionViewSet, CandidateViewSet

router = DefaultRouter()
router.register(r'elections', ElectionViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'candidates', CandidateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
