from rest_framework import serializers
from .models import Election, Position, Candidate, VoteRecord, Partylist

class PartylistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partylist
        fields = ['id', 'election', 'name', 'description']

class CandidateSerializer(serializers.ModelSerializer):
    position_name = serializers.CharField(source='position.name', read_only=True)
    partylist_name = serializers.CharField(source='partylist.name', read_only=True, default=None)

    class Meta:
        model = Candidate
        fields = ['id', 'position', 'position_name', 'name', 'description', 'photo',
                  'partylist', 'partylist_name', 'platform_statement', 'course_and_year']

class PositionSerializer(serializers.ModelSerializer):
    candidates = CandidateSerializer(many=True, read_only=True)

    class Meta:
        model = Position
        fields = ['id', 'election', 'name', 'max_votes_allowed', 'hierarchy_order', 'candidates']

class ElectionSerializer(serializers.ModelSerializer):
    positions = PositionSerializer(many=True, read_only=True)
    calculated_status = serializers.ReadOnlyField()

    class Meta:
        model = Election
        fields = ['id', 'title', 'start_date', 'end_date', 'status', 'calculated_status', 'positions']

class VoteRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoteRecord
        fields = '__all__'

class SubmitVoteSerializer(serializers.Serializer):
    election_id = serializers.IntegerField()
    selections = serializers.ListField(child=serializers.IntegerField())
