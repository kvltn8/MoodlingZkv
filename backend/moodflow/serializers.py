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
    # The app shows a recommended surah (+ reason + audio) on every mood card.
    quran_recommendations = serializers.SerializerMethodField()

    class Meta:
        model = MoodEntry
        fields = ['id', 'mood', 'description', 'animations', 'quran_recommendations', 'user', 'created_at']

        extra_kwargs = {
            'user': {'read_only': True}
        }

    def get_quran_recommendations(self, obj):
        recs = (
            MoodSurahRecommendation.objects
            .filter(mood=obj.animations)
            .select_related('surah')
            .prefetch_related('surah__audio_files__reciter')
            .order_by('id')
        )
        data = []
        for rec in recs:
            audio = rec.surah.audio_files.first()
            data.append({
                'id': rec.id,
                'reason': rec.reason,
                'surah': QuranSurahSerializer(rec.surah).data,
                'audio_url': audio.audio_url if audio else None,
                'reciter': audio.reciter.name if audio else None,
            })
        return data
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
    # Full surah info on read, so the frontend doesn't need a second request
    # per recommendation. Writes still go through `surah` (the FK id).
    surah_detail = QuranSurahSerializer(source="surah", read_only=True)

    class Meta:
        model = MoodSurahRecommendation
        fields = ['id', 'mood', 'surah', 'surah_detail', 'reason']

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