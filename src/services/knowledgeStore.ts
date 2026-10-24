import { VideoItem, Lesson, Rule, QAResponse, SupabaseConfig, SystemStatus } from '../types';
import { INITIAL_VIDEOS } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'my_knowledge_ai_videos_v1';
const LOCAL_STORAGE_QA_KEY = 'my_knowledge_ai_qa_v1';
const LOCAL_STORAGE_SUPABASE_KEY = 'my_knowledge_ai_supabase_config_v1';

export class KnowledgeStore {
  // Local storage cache
  static getLocalVideos(): VideoItem[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!data) {
        // Initialize with high quality seed videos
        this.saveLocalVideos(INITIAL_VIDEOS);
        return INITIAL_VIDEOS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read local videos:', e);
      return INITIAL_VIDEOS;
    }
  }

  static saveLocalVideos(videos: VideoItem[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(videos));
    } catch (e) {
      console.error('Failed to save local videos:', e);
    }
  }

  static addVideo(newVideo: VideoItem): VideoItem[] {
    const current = this.getLocalVideos();
    const updated = [newVideo, ...current.filter(v => v.id !== newVideo.id)];
    this.saveLocalVideos(updated);
    return updated;
  }

  static deleteVideo(id: string): VideoItem[] {
    const current = this.getLocalVideos();
    const updated = current.filter(v => v.id !== id);
    this.saveLocalVideos(updated);
    return updated;
  }

  static resetToSeed(): VideoItem[] {
    this.saveLocalVideos(INITIAL_VIDEOS);
    return INITIAL_VIDEOS;
  }

  // QA History
  static getQAHistory(): QAResponse[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_QA_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveQA(qa: QAResponse): QAResponse[] {
    try {
      const current = this.getQAHistory();
      const updated = [qa, ...current.slice(0, 19)]; // keep latest 20
      localStorage.setItem(LOCAL_STORAGE_QA_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }

  // Supabase Configuration
  static getSupabaseConfig(): SupabaseConfig {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_SUPABASE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return {
      url: '',
      anonKey: '',
      isConfigured: false,
      status: 'unconfigured'
    };
  }

  static saveSupabaseConfig(config: SupabaseConfig) {
    try {
      localStorage.setItem(LOCAL_STORAGE_SUPABASE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save Supabase config:', e);
    }
  }

  // Server health check
  static async checkSystemStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        return {
          gemini_connected: !!data.gemini_connected,
          gemini_model: data.gemini_model || 'gemini-3.8-flash',
          supabase_connected: !!data.supabase_connected,
          supabase_tables_ready: !!data.supabase_tables_ready,
          supabase_error: data.supabase_error,
          mode: data.supabase_connected && data.supabase_tables_ready ? 'supabase_sync' : 'prototype'
        };
      }
    } catch (e) {
      console.warn('System status fetch failed:', e);
    }
    return {
      gemini_connected: false,
      gemini_model: 'gemini-3.8-flash',
      supabase_connected: false,
      supabase_tables_ready: false,
      mode: 'prototype'
    };
  }

  // Test Supabase connection
  static async testSupabaseConnection(url: string, key: string) {
    const res = await fetch('/api/supabase/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, key })
    });
    return await res.json();
  }

  // Push local library to Supabase
  static async syncToSupabase(videos: VideoItem[]) {
    const res = await fetch('/api/supabase/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videos })
    });
    return await res.json();
  }
}
