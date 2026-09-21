from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import MoodEntry, User,TaskList, QuranSurah, Reciter, MoodSurahRecommendation, QuranSurahAudio
from .serializers import MoodEntrySerializer, TaskListSerializer, QuranSurahSerializer, ReciterSerializer, MoodSurahRecommendationSerializer, QuranSurahAudioSerializer
from .services.quran import get_surah_audio

@api_view(['GET'])
def server(request):
    return Response({"message": "Server is running"}, status=status.HTTP_200_OK)


class MoodEntryViewSet(viewsets.ModelViewSet):
    serializer_class = MoodEntrySerializer
    #permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskListViewSet(viewsets.ModelViewSet):
    serializer_class = TaskListSerializer
    #Permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return TaskList.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class  QuranSurahViewset(viewsets.ModelViewSet):
    serializer_class = QuranSurahSerializer
   # permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = QuranSurah.objects.all()
class  ReciterViewset(viewsets.ModelViewSet):
    serializer_class = ReciterSerializer
    queryset = Reciter.objects.all()
   # permission_classes = [IsAuthenticated, IsAdminUser]
class MoodSurahViewSet(viewsets.ModelViewSet):
    serializer_class = MoodSurahRecommendationSerializer
    queryset = MoodSurahRecommendation.objects.all()
   # permission_classes = [IsAuthenticated, IsAdminUser]

class AudioViewSet(viewsets.ModelViewSet):
    serializer_class = QuranSurahAudioSerializer
    queryset = QuranSurahAudio.objects.select_related("surah", "reciter").all()

    def get_permissions(self):
        if self.request.method in ["POST","PATCH", "PUT", "DELETE"]:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        surah = serializer.validated_data["surah"]
        reciter = serializer.validated_data["reciter"]
        reciter_id = reciter.reciter_id
        surah_id = surah.quran_id
        audio_url = get_surah_audio(surah_id, reciter_id)
        serializer.save(audio_url=audio_url)