from django.contrib import admin
from .models import Election, Position, Candidate

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
    list_display = ('name', 'election', 'max_votes_allowed')
    list_filter = ('election',)
    search_fields = ('name',)
    inlines = [CandidateInline]

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('name', 'position')
    list_filter = ('position__election',)
    search_fields = ('name',)
