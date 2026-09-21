from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(max_length=170, unique=True)
    email = models.EmailField(unique=True)
    def __str__(self):
        return self.username



class MoodEntry(models.Model):
    ANIMATION_CHOICES = [
        ("happy", "Happy"),
        ("calm", "Calm"),
        ("focused", "Focused"),
        ("tired", "Tired"),
        ("sad", "Sad"),
        ("anxious", "Anxious"),
        ("excited", "Excited"),
    ]        
    animations = models.CharField(max_length=20, choices=ANIMATION_CHOICES, default="happy")
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="moods")
    mood = models.CharField(max_length=50)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}, {self.mood}, {self.created_at}"

class TaskList(models.Model):
    Task = models.CharField(max_length=100)
    note = models.TextField(blank=True)
    is_done = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")
    created_at=models.DateField(auto_now_add=True)
    def __str__(self):
        return f"{self.user.username},{self.Task}, {self.created_at}"


class QuranSurah(models.Model):
    quran_id = models.PositiveSmallIntegerField(unique=True)
    name_arabic = models.CharField(max_length=100)
    name_english = models.CharField(max_length=100)
    name_transliteration = models.CharField(max_length=100)
    verses_count = models.PositiveSmallIntegerField()
    revelation_place = models.CharField(
        max_length=20,
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quran_id}. {self.name_english}"

class Reciter(models.Model):
    reciter_id = models.PositiveIntegerField(unique=True)
    name = models.CharField(max_length=255)
    def __str__(self):
        return self.name


class QuranSurahAudio(models.Model):
    surah = models.ForeignKey(
        QuranSurah,
        on_delete=models.CASCADE,
        related_name="audio_files",
    )
    reciter = models.ForeignKey(Reciter, on_delete=models.CASCADE, related_name="audio")
    audio_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields =["surah", "reciter"], name="unique_surah_reciter_audio"
            )
        ]

    def __str__(self):
        return f"{self.surah} - {self.reciter_name}"


class MoodSurahRecommendation(models.Model):
    mood = models.CharField(
        max_length=50,
        choices=MoodEntry.ANIMATION_CHOICES,   
    )
    surah = models.ForeignKey(
        QuranSurah,
        on_delete=models.CASCADE,
        related_name='mood_recommendations'
    )
    reason = models.TextField()

    def __str__(self):
        return f"{self.mood} → {self.surah.name_english}"  
