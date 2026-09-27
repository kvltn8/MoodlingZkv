export type MoodAnimation =
  | "happy"
  | "calm"
  | "focused"
  | "tired"
  | "sad"
  | "anxious"
  | "excited";

export type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

// Matches TasksSerializer: id, title, is_done, updated_at, end_date, created_by
export type Task = {
  id: number;
  created_by?: number;
  title: string;
  is_done: boolean;
  updated_at: string;
  end_date?: string;
  End_date?: string;
};

export type Surah = {
  id: number;
  quran_id: number;
  name_arabic: string;
  name_english: string;
  name_transliteration: string;
  verses_count: number;
  revelation_place?: string | null;
};

// Returned inside each mood as `quran_recommendations` (see backend serializers.py patch)
export type SurahRecommendation = {
  id: number;
  reason: string;
  surah: Surah;
  audio_url: string | null;
  reciter?: string | null;
};

export type Mood = {
  id: number;
  created_by?: number;
  name: string;
  note: string;
  animation?: MoodAnimation | string | null;
  quran_recommendations?: SurahRecommendation[];
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};