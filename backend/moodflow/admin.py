from django.contrib import admin


from.models import(
    User,
    MoodEntry,
    TaskList,
    QuranSurah,
    Reciter,
    QuranSurahAudio,
    MoodSurahRecommendation
)

@admin.register(User)
class Users(admin.ModelAdmin):
  list_display = ("id", "username", "email")
  search_fields = ("username",)

@admin.register(MoodEntry)
class Moods(admin.ModelAdmin):
  list_display = ("id", "animations", "user", "mood")
  list_select_related = ("user",)

@admin.register(TaskList)
class Tasks(admin.ModelAdmin):
  list_display = ("id", "Task", "is_done","user")
  list_select_related = ("user",)

@admin.register(QuranSurah)
class Quran(admin.ModelAdmin):
  list_display = ("id", "name_arabic", "verses_count", "revelation_place")
  search_fields = ("revelation_place",)

@admin.register(QuranSurahAudio)
class Audio(admin.ModelAdmin):
  list_display = ("id", "reciter", "audio_url", "surah")
  list_select_related = ("reciter", "surah",)

@admin.register(Reciter)
class Qari(admin.ModelAdmin):
  list_display = ("id", "name",)

@admin.register(MoodSurahRecommendation)
class surahrec(admin.ModelAdmin):
  list_display = ("id", "surah","mood","reason")
  list_select_related = ("surah",)