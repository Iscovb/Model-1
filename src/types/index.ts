export type SourceType = 'youtube' | 'upload';

export interface TimestampedItem {
  timestamp_seconds: number;
  timestamp_label: string; // e.g., "04:20"
}

export interface Lesson {
  id: string;
  video_id: string;
  video_title: string;
  title: string;
  summary: string;
  timestamp_start: number; // seconds
  timestamp_end: number;   // seconds
  timestamp_label: string; // e.g., "02:15 - 05:40"
  key_takeaways: string[];
  category: string;
}

export interface Rule {
  id: string;
  video_id: string;
  video_title: string;
  rule_statement: string; // e.g. "Never let UI layer directly mutate database records"
  rationale: string;
  timestamp_seconds: number;
  timestamp_label: string; // e.g. "08:12"
  category: string;
  severity: 'essential' | 'recommended' | 'avoid';
}

export interface ExampleItem {
  id: string;
  video_id: string;
  video_title: string;
  context: string;
  code_or_demonstration: string;
  timestamp_seconds: number;
  timestamp_label: string;
}

export interface VideoItem {
  id: string;
  title: string;
  source_type: SourceType;
  source_url: string;
  youtube_id?: string;
  duration_seconds: number;
  duration_label: string;
  channel_or_author: string;
  summary: string;
  tags: string[];
  created_at: string;
  lessons: Lesson[];
  rules: Rule[];
  examples: ExampleItem[];
  file_name?: string;
  quota_fallback?: boolean;
  analysis_notice?: string;
}

export interface Citation {
  video_id: string;
  video_title: string;
  timestamp_seconds: number;
  timestamp_label: string;
  quote_or_context: string;
}

export interface QAResponse {
  id: string;
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low' | 'uncertain';
  confidence_score: number; // 0 to 100
  uncertainty_notice: string | null;
  citations: Citation[];
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  status: 'unconfigured' | 'testing' | 'connected' | 'error';
  errorMessage?: string;
  tablesStatus?: {
    videos: boolean;
    lessons: boolean;
    rules: boolean;
  };
}

export interface SystemStatus {
  gemini_connected: boolean;
  gemini_model: string;
  supabase_connected: boolean;
  supabase_tables_ready: boolean;
  supabase_error?: string;
  mode: 'prototype' | 'supabase_sync';
}
