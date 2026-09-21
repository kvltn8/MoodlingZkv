from djoser.serializers import UserCreateSerializer as BaseSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer
from rest_framework import serializers
from .models import MoodEntry, TaskList, QuranSurah, MoodSurahRecommendation, Reciter,QuranSurahAudio

class UserCreateSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        fields=("id","username","email","password")

class UserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        fields=("id","username","email")

class MoodEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodEntry
        fields = ["id", "mood", "created_at", "user","description"]
        extra_kwargs = {
            "user": {"read_only":True}
        }
class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskList
        fields=("id", "Task","note","is_done","user","created_at")
        extra_kwargs = {
            "user": {"read_only":True}
        }


class QuranSurahSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuranSurah
        fields = [
            "id",
            "quran_id",
            "name_arabic",
            "name_english",
            "name_transliteration",
            "verses_count",
            "revelation_place",
        ]

class MoodSurahRecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodSurahRecommendation
        fields = ['id', 'mood', 'surah', 'reason']

class ReciterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reciter
        fields = ["id", "reciter_id", "name"]

class QuranSurahAudioSerializer(serializers.ModelSerializer):


    class Meta:
        model = QuranSurahAudio
        fields = [
            "id", "surah", "reciter",
            "audio_url", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "audio_url"]