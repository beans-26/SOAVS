from django.db import models
from django.utils import timezone

class Election(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
    )
    title = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')

    @property
    def calculated_status(self):
        now = timezone.now()
        if self.status == 'DRAFT':
            return 'DRAFT'
        if self.status == 'COMPLETED' or now > self.end_date:
            return 'COMPLETED'
        if now < self.start_date:
            return 'UPCOMING'
        return 'ACTIVE'

    def __str__(self):
        return self.title

class Position(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='positions')
    name = models.CharField(max_length=150)
    max_votes_allowed = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.name} - {self.election.title}"

class Candidate(models.Model):
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='candidates')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='candidate_photos/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} ({self.position.name})"

class VoteRecord(models.Model):
    election = models.ForeignKey(Election, on_delete=models.CASCADE, related_name='votes')
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='votes')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='votes')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'election']

    def __str__(self):
        return f"Vote for {self.candidate.name} under {self.position.name}"
