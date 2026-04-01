# Reading Flow - System Architecture

> **Updated**: 2026-04-02 | **Live**: https://reading-flow-3yq.pages.dev | **Repo**: https://github.com/ninanonanssilo/reading-flow

---

## 1. Overview

Reading Flow is an AI-powered reading fluency app for elementary students.
Students read aloud, Web Speech API transcribes in real-time, and BASA algorithm auto-grades 5 error types.
Lumi (AI character) provides adaptive scaffolding via HHAIR model. Teachers monitor via dashboard.

### Theoretical Framework

| Theory | File | Description |
|--------|------|-------------|
| **BASA** (Kim, 2011) | basa.ts | 5-type error: substitution / omission / addition / repetition / self-correction |
| **CWPM** | basa.ts | Correct syllables per minute - core fluency metric |
| **HHAIR** (Molenaar, 2022) | scaffold.ts | 4-level regulation: AI - Co - Shared - Self |
| **FLoRA** (Li et al., 2025) | eventLogger.ts | Instrumentation - Trace - Scaffold pipeline |
| **SRL** (Zimmerman, 2000) | App flow | Goal - Read - Self-assess cycle |
| **Social Agency** (Mayer, 2014) | Lumi.tsx | Visual AI character boosts motivation |

---

## 2. Architecture Diagram

```
Cloudflare Pages (reading-flow-3yq.pages.dev)
         |
    +---------+----------+-----------+
    |         |          |           |
 Student   Teacher    Supabase    IndexedDB
  App      Dashboard  PostgreSQL   (Audio)
 (Tablet)   (PC)     + Realtime
    |         |          |
    +--- localStorage ---+  (offline fallback)
```

### Data Flow

```
[Student Tablet]                          [Teacher PC]
     |                                        |
     | 1. Voice record + transcription        |
     | 2. BASA error analysis                 |
     | 3. Scaffold generation                 |
     | 4. Event log collection                |
     v                                        v
  FlowContext  --saveSession()-->  Supabase sessions
  commitSession()                 (or localStorage)
                                        |
                                  loadClassroom()
                                        v
                                   Dashboard (real-time charts)
```

---

## 3. Project Structure

```
src/
  App.tsx                      # Router (17 routes)
  context/
    AuthContext.tsx             # Auth with SHA-256 hashing
    FlowContext.tsx            # Reading flow state management
  data/
    constants.ts               # Levels, badges, goal options
    passages.ts                # 30 passages (3 difficulty x 10)
    lumiMessages.ts           # Lumi character dialogues
    privacyTexts.ts           # Consent texts (parent/student/IRB)
  hooks/
    useSpeechRecognition.ts   # Web Speech API wrapper
    useScreenLogger.ts        # Auto screen enter/exit logging
    useActivityLogger.ts      # Activity logging wrapper
    useRealtimeSessions.ts    # Supabase realtime subscription
  lib/
    supabase.ts               # Supabase client (auto-fallback)
    api.ts                    # CRUD: sessions, reclassifications
  utils/
    basa.ts                   # BASA 5-type error detection
    scaffold.ts              # Adaptive scaffolding (HHAIR 4-level)
    eventLogger.ts          # Timestamp logging + XES/CSV export
    privacy.ts              # Hashing, consent, anonymization, deletion
    reclassification.ts     # Teacher reclassification + Cohen kappa
    offlineQueue.ts         # Offline queue for unstable networks
  student/
    components/  Lumi.tsx, StudentLayout, MetricCard, StarRating, etc.
    pages/       14 screens (ConsentFlow ~ Completion)
  teacher/
    components/  StudentDetailPanel, WordMappingEditor, ReclassificationSummary
    pages/       Dashboard.tsx, PrivacyManagement.tsx
supabase/migrations/   5 SQL files
```

---

## 4. Student App Screen Flow

```
RoleSelect --> Login --> ConsentFlow --> WelcomeScreen
                                             |
                               +-------------+-------------+
                         SessionHistory            PassageSelect
                                                        |
                                                  GoalSetting
                                                        |
                                                ReadingActivity  <-- CORE
                                                        |
                                                 SelfAssessment
                                                        |
                                                 ResultAnalysis
                                                        |
                                                  Completion --> loop
```

### 4.1 Consent Flow (IRB Required)

1. **Parent step**: Read consent doc - Check required/optional items - Enter parent name/relation/date
2. **Student step**: Lumi character greets student - Student confirms understanding
3. Consent stored in localStorage, checked on every WelcomeScreen load
4. No valid consent = auto redirect to /consent

### 4.2 SRL Mapping

| Screen | SRL Process | HHAIR Level |
|--------|-------------|-------------|
| GoalSetting | Planning | Co-regulation (Lumi suggests) |
| ReadingActivity | Execution | AI-regulation (ASR monitors) |
| SelfAssessment | Evaluation | Self-regulation (student judges) |
| ResultAnalysis | Monitoring | Shared-regulation (AI vs self) |

---

## 5. Core Algorithms

### 5.1 BASA 5-Type Error Detection

| Stage | Process | Result |
|-------|---------|--------|
| 1 | Consecutive duplicate word detection | **Repetition** (R) |
| 2 | Error word then correct word pattern | **Self-correction** (SC) |
| 3 | LCS-based word alignment | **Substitution** (S) / **Omission** (O) / **Addition** (A) |

### 5.2 HHAIR Adaptive Scaffolding

| HHAIR Level | Accuracy | Scaffold Type | Lumi Tone |
|-------------|----------|---------------|-----------|
| AI-adjusted | < 50% | **directive** | Direct instruction |
| Co-regulated | 50-64% | **suggestive** | Suggestions |
| Shared-regulated | 65-79% | **reflective** | Reflection prompts |
| Self-regulated | 80%+ | **celebratory** | Celebration |

Teacher reclassification (adjustedAccuracy) overrides AI accuracy for next HHAIR.

### 5.3 Cohen kappa (Inter-rater Reliability)

- Po = (total words - reclassified) / total words
- kappa = (Po - Pe) / (1 - Pe)
- >= 0.81 Almost Perfect / >= 0.61 Substantial / >= 0.41 Moderate

### 5.4 Event Logging (Process Mining Ready)

| Activity Types | SRL Phase |
|---------------|-----------|
| passage_select, goal_select, confidence_set | Planning |
| reading_start, reading_end, reading_retry | Execution |
| self_rating_set, difficulty_set, assessment_submit | Evaluation |
| result_scroll, error_reclassify, scaffold_view | Monitoring |

Export: **XES** (ProM/Disco), **CSV** (spreadsheet)

---

## 6. Database

### Supabase Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| teachers | Teacher accounts | email, password_hash |
| classrooms | Classes | name, teacher_id |
| students | Student profiles | name, pin, level, total_stars, badges |
| sessions | Reading sessions | accuracy, cwpm, error_counts, word_mappings, event_logs, scaffold_data, hhair_level, adjusted_accuracy |
| consent_records | Consent | required_data, audio_recording, event_logging, parent_name |
| error_reclassifications | Teacher corrections | session_id, word_index, original_type, reclassified_type |

### localStorage (Offline)

| Key | Purpose |
|-----|---------|
| reading-flow-player | Student profile + sessions |
| reading-flow-consent | Consent record |
| reading-flow-users | User accounts |
| reading-flow-offline-queue | Unsent data queue |

---

## 7. Implementation Status

| # | Feature | Status | Files |
|---|---------|--------|-------|
| 1 | Lumi Character | DONE | Lumi.tsx, lumiMessages.ts |
| 2 | Adaptive Scaffolding | DONE | scaffold.ts (HHAIR + fading) |
| 3 | Supabase Integration | DONE | api.ts, supabase.ts |
| 4 | Session History | DONE | SessionHistory.tsx, StudentDetailPanel.tsx |
| 5 | Timestamp Logging | DONE | eventLogger.ts (XES/CSV) |
| 6 | Teacher Reclassification | DONE | reclassification.ts, WordMappingEditor.tsx |
| 7 | Privacy Enhancement | DONE | privacy.ts, ConsentFlow.tsx |

---

## 8. Privacy Protection

| Feature | File | Legal Basis |
|---------|------|-------------|
| Parent consent form | ConsentFlow.tsx | Privacy Act Art. 22 |
| Student assent | ConsentFlow.tsx | IRB ethics |
| SHA-256 password hash | AuthContext.tsx | InfoSec |
| Consent-gated recording | ReadingActivity.tsx | Data minimization |
| Consent-gated logging | eventLogger.ts | Privacy by Design |
| Anonymized export | PrivacyManagement.tsx | Privacy Act Art. 58 |
| Data deletion | privacy.ts | GDPR Art. 17 |

---

## 9. Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 18 + TypeScript + Vite 6 |
| Styling | Tailwind CSS 4 |
| Charts | Chart.js + react-chartjs-2 |
| Speech | Web Speech API (Chrome/Edge) |
| Audio | MediaRecorder + IndexedDB |
| Backend | Supabase (PostgreSQL + Realtime) |
| Deploy | Cloudflare Pages |

---

## 10. Deployment

```bash
npm install && npm run dev              # Local dev
npm run build                           # Production build
npx wrangler pages deploy dist --project-name=reading-flow  # CF deploy
```

| Variable | Required | Purpose |
|----------|----------|---------|
| VITE_SUPABASE_URL | No | Supabase URL |
| VITE_SUPABASE_ANON_KEY | No | Supabase key |

Without env vars = offline-only mode (localStorage/IndexedDB).

**Production**: https://reading-flow-3yq.pages.dev

---

## 11. Gamification

| Level | Name | Sessions | Stars |
|-------|------|----------|-------|
| 1 | Moon Base | 0 | 0 |
| 2 | Mars Explorer | 3 | 5 |
| 3 | Saturn Ring | 7 | 15 |
| 4 | Galaxy Voyage | 12 | 30 |
| 5 | Star Master | 20 | 50 |

Stars per session: >= 85% accuracy = 3, >= 60% = 2, < 60% = 1
