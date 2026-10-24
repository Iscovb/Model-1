import { VideoItem } from '../types';

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-seed-1',
    title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
    source_type: 'youtube',
    source_url: 'https://www.youtube.com/watch?v=5OihB_V54u4',
    youtube_id: '5OihB_V54u4',
    duration_seconds: 1420,
    duration_label: '23:40',
    channel_or_author: 'TechLead Architecture',
    summary: 'A deep-dive masterclass on decoupling core domain logic from frameworks, handling boundary interfaces, and preventing architectural rot as systems scale.',
    tags: ['Architecture', 'Clean Code', 'TypeScript', 'Best Practices'],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    lessons: [
      {
        id: 'les-1-1',
        video_id: 'vid-seed-1',
        video_title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
        title: 'The Inversion of Control Principle in Domain Services',
        summary: 'Frameworks should be external plugins to your core business logic, never the foundation upon which your entities depend.',
        timestamp_start: 135,
        timestamp_end: 420,
        timestamp_label: '02:15 - 07:00',
        category: 'Architecture',
        key_takeaways: [
          'Domain entities must never import database drivers or HTTP framework libraries.',
          'Inject repository interfaces rather than concrete database clients.',
          'Write domain tests with zero external mocks or network dependencies.'
        ]
      },
      {
        id: 'les-1-2',
        video_id: 'vid-seed-1',
        video_title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
        title: 'Use Case Interactors and Orchestration Flow',
        summary: 'Each user action or business transaction should have a dedicated single-responsibility interactor command.',
        timestamp_start: 430,
        timestamp_end: 810,
        timestamp_label: '07:10 - 13:30',
        category: 'Design Patterns',
        key_takeaways: [
          'Keep use case files under 150 lines by delegating validation to domain value objects.',
          'Return plain result types (Success / Failure) rather than throwing unchecked exceptions across layers.',
          'Boundary mappers ensure data transfer objects (DTOs) do not leak raw internal records.'
        ]
      },
      {
        id: 'les-1-3',
        video_id: 'vid-seed-1',
        video_title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
        title: 'Decoupling Database Drivers with Ports & Adapters',
        summary: 'How Hexagonal architecture isolates Postgres/Supabase schemas from business invariants.',
        timestamp_start: 835,
        timestamp_end: 1240,
        timestamp_label: '13:55 - 20:40',
        category: 'Data Access',
        key_takeaways: [
          'Store database migrations in adapter repositories.',
          'Never expose autoincrement integer IDs directly to public client APIs; use UUIDv7 or prefixed KSUIDs.',
          'Handle optimistic concurrency at the domain aggregate level.'
        ]
      }
    ],
    rules: [
      {
        id: 'rul-1-1',
        video_id: 'vid-seed-1',
        video_title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
        rule_statement: 'Never import HTTP handlers or ORM entities directly into domain logic modules.',
        rationale: 'Doing so couples your domain to third-party framework churn and makes automated unit testing orders of magnitude slower.',
        timestamp_seconds: 245,
        timestamp_label: '04:05',
        category: 'Architecture',
        severity: 'essential'
      },
      {
        id: 'rul-1-2',
        video_id: 'vid-seed-1',
        video_title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
        rule_statement: 'Validate input invariants inside Value Objects rather than scattered through Controller classes.',
        rationale: 'Guarantees that once a domain object exists in memory, it is impossible for it to be in an invalid or corrupted state.',
        timestamp_seconds: 560,
        timestamp_label: '09:20',
        category: 'Domain Modeling',
        severity: 'essential'
      },
      {
        id: 'rul-1-3',
        video_id: 'vid-seed-1',
        video_title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
        rule_statement: 'Avoid generic "Utils" or "Helpers" folders; group code strictly by feature bounded context.',
        rationale: 'Utils files become monolithic dumping grounds that violate single-responsibility boundaries and hide circular dependencies.',
        timestamp_seconds: 980,
        timestamp_label: '16:20',
        category: 'Organization',
        severity: 'avoid'
      }
    ],
    examples: [
      {
        id: 'ex-1-1',
        video_id: 'vid-seed-1',
        video_title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
        context: 'Defining a strict port interface for user persistence',
        code_or_demonstration: 'export interface UserRepositoryPort {\n  findById(id: UserId): Promise<User | null>;\n  save(user: User): Promise<void>;\n}',
        timestamp_seconds: 320,
        timestamp_label: '05:20'
      },
      {
        id: 'ex-1-2',
        video_id: 'vid-seed-1',
        video_title: 'Clean Architecture in 2026: Modular Boundaries and Micro-Layers',
        context: 'Encapsulating email validation in an immutable Value Object',
        code_or_demonstration: 'class EmailAddress {\n  private constructor(public readonly value: string) {}\n  static create(raw: string): Result<EmailAddress> {\n    if (!/^[^@]+@[^@]+\\.[^@]+$/.test(raw)) return Result.fail("Invalid email");\n    return Result.ok(new EmailAddress(raw.toLowerCase().trim()));\n  }\n}',
        timestamp_seconds: 645,
        timestamp_label: '10:45'
      }
    ]
  },
  {
    id: 'vid-seed-2',
    title: 'High-Throughput Distributed Systems: Resiliency, Caching & Queues',
    source_type: 'youtube',
    source_url: 'https://www.youtube.com/watch?v=0kFhygT7zVw',
    youtube_id: '0kFhygT7zVw',
    duration_seconds: 1890,
    duration_label: '31:30',
    channel_or_author: 'Distributed Engineering Digest',
    summary: 'Core patterns for handling millions of concurrent requests, including circuit breakers, idempotency keys, and read-through caching without cache stampedes.',
    tags: ['System Design', 'Backend', 'Caching', 'Resilience'],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    lessons: [
      {
        id: 'les-2-1',
        video_id: 'vid-seed-2',
        video_title: 'High-Throughput Distributed Systems: Resiliency, Caching & Queues',
        title: 'The Circuit Breaker Pattern and Exponential Jitter',
        summary: 'Failing fast protects upstream microservices from cascading collapses during transient outages.',
        timestamp_start: 190,
        timestamp_end: 610,
        timestamp_label: '03:10 - 10:10',
        category: 'Fault Tolerance',
        key_takeaways: [
          'Trip circuit breakers when error rate exceeds 30% over 10 consecutive seconds.',
          'Always add randomized jitter to retry intervals to prevent the thundering herd problem.',
          'Fall back to stale cached data during open circuit breaker states.'
        ]
      },
      {
        id: 'les-2-2',
        video_id: 'vid-seed-2',
        video_title: 'High-Throughput Distributed Systems: Resiliency, Caching & Queues',
        title: 'Cache Stampede Prevention with Probabilistic Early Expiration',
        summary: 'How the XFetch algorithm proactively recalculates heavy cache keys before TTL expiration.',
        timestamp_start: 780,
        timestamp_end: 1220,
        timestamp_label: '13:00 - 20:20',
        category: 'Performance',
        key_takeaways: [
          'Single-flight request coalescing ensures only one worker queries the origin database.',
          'Probabilistic early recomputation eliminates latency spikes on hot items.',
          'Separate volatile user session caches from immutable shared content caches.'
        ]
      }
    ],
    rules: [
      {
        id: 'rul-2-1',
        video_id: 'vid-seed-2',
        video_title: 'High-Throughput Distributed Systems: Resiliency, Caching & Queues',
        rule_statement: 'Every mutating HTTP POST/PATCH endpoint must enforce an Idempotency-Key header.',
        rationale: 'Network timeouts lead clients to retry requests; without idempotency keys, duplicate charges or double mutations inevitably occur.',
        timestamp_seconds: 410,
        timestamp_label: '06:50',
        category: 'API Design',
        severity: 'essential'
      },
      {
        id: 'rul-2-2',
        video_id: 'vid-seed-2',
        video_title: 'High-Throughput Distributed Systems: Resiliency, Caching & Queues',
        rule_statement: 'Never deploy retries without randomized jitter and explicit maximum attempt caps.',
        rationale: 'Synchronized retries amplify server load during a partial degradation and transform a 10% packet drop into a complete outage.',
        timestamp_seconds: 530,
        timestamp_label: '08:50',
        category: 'Reliability',
        severity: 'essential'
      },
      {
        id: 'rul-2-3',
        video_id: 'vid-seed-2',
        video_title: 'High-Throughput Distributed Systems: Resiliency, Caching & Queues',
        rule_statement: 'Set strict connection pool timeouts on database queries (never allow unbounded waits).',
        rationale: 'Unbounded pool acquisition locks up Node.js event loops and starves lightweight read routes.',
        timestamp_seconds: 1410,
        timestamp_label: '23:30',
        category: 'Database',
        severity: 'recommended'
      }
    ],
    examples: [
      {
        id: 'ex-2-1',
        video_id: 'vid-seed-2',
        video_title: 'High-Throughput Distributed Systems: Resiliency, Caching & Queues',
        context: 'Calculating exponential backoff with full jitter formula in seconds',
        code_or_demonstration: 'const sleepMs = Math.random() * (Math.pow(2, attempt) * 100);',
        timestamp_seconds: 575,
        timestamp_label: '09:35'
      }
    ]
  },
  {
    id: 'vid-seed-3',
    title: 'Cognitive Load Theory & Deep Work for Software Engineers',
    source_type: 'youtube',
    source_url: 'https://www.youtube.com/watch?v=2LzWfKkFp4o',
    youtube_id: '2LzWfKkFp4o',
    duration_seconds: 1140,
    duration_label: '19:00',
    channel_or_author: 'Mindset & Systems',
    summary: 'Practical mental frameworks for maximizing focused problem solving, organizing technical knowledge, and avoiding context-switching fatigue.',
    tags: ['Productivity', 'Learning', 'Mental Models', 'Engineering Mindset'],
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    lessons: [
      {
        id: 'les-3-1',
        video_id: 'vid-seed-3',
        video_title: 'Cognitive Load Theory & Deep Work for Software Engineers',
        title: 'Intrinsic vs Extraneous vs Germane Cognitive Load',
        summary: 'Designing your development environment to eliminate extraneous noise so mental energy is channeled into germane problem-solving.',
        timestamp_start: 90,
        timestamp_end: 450,
        timestamp_label: '01:30 - 07:30',
        category: 'Cognitive Science',
        key_takeaways: [
          'Working memory can only hold 4 items simultaneously.',
          'Externalize state into structured notes or diagrams to free working memory.',
          'Automated linters and typecheckers remove extraneous syntax overhead.'
        ]
      },
      {
        id: 'les-3-2',
        video_id: 'vid-seed-3',
        video_title: 'Cognitive Load Theory & Deep Work for Software Engineers',
        title: 'The 90-Minute Focus Ultradian Rhythm',
        summary: 'Synchronizing high-intensity engineering sprints with natural biological alertness cycles.',
        timestamp_start: 510,
        timestamp_end: 840,
        timestamp_label: '08:30 - 14:00',
        category: 'Daily Routine',
        key_takeaways: [
          'Dedicate the first 90 minutes of the morning to the single most difficult architectural problem.',
          'Batch communication and message replies into a 30-minute afternoon block.',
          'Take genuine disengagement breaks without screens between intense problem solving.'
        ]
      }
    ],
    rules: [
      {
        id: 'rul-3-1',
        video_id: 'vid-seed-3',
        video_title: 'Cognitive Load Theory & Deep Work for Software Engineers',
        rule_statement: 'Write the public API or test signature before thinking about internal algorithmic implementation.',
        rationale: 'Reduces intrinsic cognitive load by separating "what the client needs" from "how the machine executes it".',
        timestamp_seconds: 340,
        timestamp_label: '05:40',
        category: 'Problem Solving',
        severity: 'recommended'
      },
      {
        id: 'rul-3-2',
        video_id: 'vid-seed-3',
        video_title: 'Cognitive Load Theory & Deep Work for Software Engineers',
        rule_statement: 'Never leave an unfinished problem at the end of the day without writing a 2-sentence "resume breadcrumb".',
        rationale: 'Prevents the Zeigarnik effect from interrupting sleep and eliminates the 20-minute morning ramp-up delay.',
        timestamp_seconds: 910,
        timestamp_label: '15:10',
        category: 'Habits',
        severity: 'essential'
      }
    ],
    examples: [
      {
        id: 'ex-3-1',
        video_id: 'vid-seed-3',
        video_title: 'Cognitive Load Theory & Deep Work for Software Engineers',
        context: 'Format of a daily 2-sentence resume breadcrumb',
        code_or_demonstration: 'CURRENT STATE: Auth token refresh endpoint returns 401 when refresh_token expires.\nNEXT STEP: Inspect jwt.verify expiry check in src/auth/tokenService.ts line 42.',
        timestamp_seconds: 945,
        timestamp_label: '15:45'
      }
    ]
  }
];

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- My Knowledge AI: Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run)
-- ==========================================

-- 1. Create Videos Table
create table if not exists public.videos (
  id text primary key,
  title text not null,
  source_type text not null check (source_type in ('youtube', 'upload')),
  source_url text not null,
  youtube_id text,
  duration_seconds integer default 0,
  duration_label text default '00:00',
  channel_or_author text default '',
  summary text not null,
  tags text[] default array[]::text[],
  file_name text,
  created_at timestamptz default now()
);

-- 2. Create Lessons Table
create table if not exists public.lessons (
  id text primary key,
  video_id text not null references public.videos(id) on delete cascade,
  video_title text not null,
  title text not null,
  summary text not null,
  timestamp_start integer default 0,
  timestamp_end integer default 0,
  timestamp_label text default '00:00',
  key_takeaways text[] default array[]::text[],
  category text default 'General',
  created_at timestamptz default now()
);

-- 3. Create Rules Table
create table if not exists public.rules (
  id text primary key,
  video_id text not null references public.videos(id) on delete cascade,
  video_title text not null,
  rule_statement text not null,
  rationale text not null,
  timestamp_seconds integer default 0,
  timestamp_label text default '00:00',
  category text default 'General',
  severity text not null check (severity in ('essential', 'recommended', 'avoid')),
  created_at timestamptz default now()
);

-- 4. Create Examples Table
create table if not exists public.examples (
  id text primary key,
  video_id text not null references public.videos(id) on delete cascade,
  video_title text not null,
  context text not null,
  code_or_demonstration text not null,
  timestamp_seconds integer default 0,
  timestamp_label text default '00:00',
  created_at timestamptz default now()
);

-- 5. Create Q&A Audit Log
create table if not exists public.qa_history (
  id text primary key,
  question text not null,
  answer text not null,
  confidence text not null,
  confidence_score integer default 0,
  uncertainty_notice text,
  citations jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 6. Enable Row Level Security (RLS) and allow public/anon access for the app
alter table public.videos enable row level security;
alter table public.lessons enable row level security;
alter table public.rules enable row level security;
alter table public.examples enable row level security;
alter table public.qa_history enable row level security;

-- Policies for public access via anon key
create policy "Allow all operations for anon" on public.videos for all using (true) with check (true);
create policy "Allow all operations for anon" on public.lessons for all using (true) with check (true);
create policy "Allow all operations for anon" on public.rules for all using (true) with check (true);
create policy "Allow all operations for anon" on public.examples for all using (true) with check (true);
create policy "Allow all operations for anon" on public.qa_history for all using (true) with check (true);

-- Helpful indexes for rapid knowledge search
create index if not exists idx_lessons_video_id on public.lessons(video_id);
create index if not exists idx_rules_video_id on public.rules(video_id);
create index if not exists idx_examples_video_id on public.examples(video_id);
create index if not exists idx_rules_severity on public.rules(severity);
`;
