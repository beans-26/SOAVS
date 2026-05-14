from rest_framework import serializers
from .models import Election, Position, Candidate

class CandidateSerializer(serializers.ModelSerializer):
    position_name = serializers.CharField(source='position.name', read_only=True)
    
    class Meta:
        model = Candidate
        fields = ['id', 'position', 'position_name', 'name', 'description', 'photo']

class PositionSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True, read_only=True)
    
    class Meta:
        model = Position
        fields = ['id', 'election', 'name', 'max_votes_allowed', 'candidates']

class ElectionSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)
    calculated_status = serializers.ReadOnlyField()

    class Meta:
        model = Election
        fields = ['id', 'title', 'start_date', 'end_date', 'status', 'calculated_status', 'positions']
