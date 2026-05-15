from django.contrib import admin
from .models import Election, Position, Candidate, Partylist

class PositionInline(admin.TabularInline):
    model = Position
    extra = 1

class CandidateInline(admin.TabularInline):
    model = Candidate
    extra = 1

@admin.register(Election)
class ElectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'status')
    list_filter = ('status',)
    search_fields = ('title',)
    inlines = [PositionInline]

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('name', 'election', 'max_votes_allowed', 'hierarchy_order')
    list_filter = ('election',)
    search_fields = ('name',)
    inlines = [CandidateInline]

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'partylist', 'course_and_year')
    list_filter = ('position__election', 'partylist')
    search_fields = ('name',)

@admin.register(Partylist)
class PartylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'election')
    list_filter = ('election',)
    search_fields = ('name',)
