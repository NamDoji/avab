# AvaB Curriculum Generator — System Architecture

> **Document Type:** Technical Architecture Specification  
> **Version:** 1.0.0  
> **Author:** AvaB Curriculum Architect  
> **Created:** 2026-07-04  
> **Status:** Canonical Reference  

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Core Data Structures](#2-core-data-structures)
3. [Topic Structure Schema](#3-topic-structure-schema)
4. [Generator Algorithms](#4-generator-algorithms)
5. [Database Design](#5-database-design)
6. [Workflow Design](#6-workflow-design)
7. [AI Model Integration Points](#7-ai-model-integration-points)
8. [Output Formats](#8-output-formats)
9. [QA Checklist](#9-qa-checklist--generator)
10. [Best Practices & Anti-Patterns](#10-best-practices--anti-patterns)
11. [Integration với AvaB Platform](#11-integration-với-avab-platform)

---

## 1. System Architecture Overview

### 1.1 High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AvaB Curriculum Generator System                      │
│                                                                               │
│  ┌─────────────────┐     ┌─────────────────────────────────────────────┐    │
│  │   INPUT LAYER   │     │              GENERATOR CORE                  │    │
│  │                 │     │                                               │    │
│  │  Admin UI       │────▶│  ┌──────────────┐   ┌───────────────────┐  │    │
│  │  API Endpoint   │     │  │  Validator   │──▶│  Knowledge Graph  │  │    │
│  │  CLI Tool       │     │  │  Service     │   │  Loader           │  │    │
│  │  Bulk Import    │     │  └──────────────┘   └────────┬──────────┘  │    │
│  └─────────────────┘     │                              │              │    │
│                           │  ┌──────────────────────────▼──────────┐  │    │
│                           │  │         Pipeline Orchestrator        │  │    │
│                           │  │  (main generation workflow engine)   │  │    │
│                           │  └──────────────────────────┬──────────┘  │    │
│                           │           ┌──────────────────┘             │    │
│                           │           ▼                                 │    │
│                           │  ┌────────────────────────────────────┐   │    │
│                           │  │         Generator Modules           │   │    │
│                           │  │                                     │   │    │
│                           │  │  ┌─────────────────────────────┐  │   │    │
│                           │  │  │  Roadmap Generator           │  │   │    │
│                           │  │  │  Prerequisite Graph Builder  │  │   │    │
│                           │  │  │  Difficulty Curve Generator  │  │   │    │
│                           │  │  │  Lesson Sequencer            │  │   │    │
│                           │  │  │  Assessment Plan Generator   │  │   │    │
│                           │  │  │  Homework Plan Generator     │  │   │    │
│                           │  │  │  Review Schedule Generator   │  │   │    │
│                           │  │  │  Gamification Generator      │  │   │    │
│                           │  │  │  AI Tutor Plan Generator     │  │   │    │
│                           │  │  │  Video Plan Generator        │  │   │    │
│                           │  │  └─────────────────────────────┘  │   │    │
│                           │  └────────────────────────────────────┘   │    │
│                           └─────────────────────────────────────────────┘   │
│                                                                               │
│  ┌─────────────────┐     ┌─────────────────────────────────────────────┐    │
│  │  AI SERVICES    │     │              OUTPUT LAYER                    │    │
│  │                 │     │                                               │    │
│  │  GPT-4o         │◀────│  ┌──────────────┐   ┌───────────────────┐  │    │
│  │  GPT-4o-mini    │     │  │  Blueprint   │──▶│  Exporters        │  │    │
│  │  Claude Sonnet  │     │  │  Assembler   │   │  (JSON/MD/CSV/    │  │    │
│  │  Claude Opus    │────▶│  └──────────────┘   │   SCORM/DB Seed)  │  │    │
│  └─────────────────┘     │                     └───────────────────┘  │    │
│                           │  ┌──────────────┐                          │    │
│  ┌─────────────────┐     │  │  QA Validator│                          │    │
│  │  DATA LAYER     │     │  └──────────────┘                          │    │
│  │                 │     │  ┌──────────────┐                          │    │
│  │  PostgreSQL     │◀────│  │  Cache Layer │                          │    │
│  │  Redis Cache    │     │  │  (blueprint  │                          │    │
│  │  Knowledge DB   │     │  │   dedup)     │                          │    │
│  └─────────────────┘     │  └──────────────┘                          │    │
│                           └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Generator Pipeline

```
INPUT PARAMETERS
      │
      ▼
┌─────────────────┐
│   VALIDATION    │  ← Schema check, range check, constraint check
│   LAYER         │    Reject invalid; auto-correct where possible
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  KNOWLEDGE      │  ← Load subject knowledge graph for given grade
│  GRAPH LOADER   │    Fetch from topic_library + knowledge_nodes tables
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PREREQUISITE   │  ← Topological sort on knowledge graph
│  GRAPH BUILDER  │    Detect + resolve circular dependencies
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TOPIC          │  ← Backward Design (UbD): outcomes → topics
│  SEQUENCER      │    Apply interleaving + spiral curriculum
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DIFFICULTY     │  ← S-curve distribution across topic sequence
│  CURVE ENGINE   │    Profile: FOUNDATION / STANDARD / ADVANCED / HSG
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  LESSON         │  ← Spaced repetition sequencing per topic
│  SEQUENCER      │    Inject review lessons at optimal intervals
└────────┬────────┘
         │
         ▼
┌────────────────────────────────────────────────────┐
│              PARALLEL PLAN GENERATORS               │
│                                                     │
│  Assessment Plan ──┐                                │
│  Homework Plan ────┤                                │
│  Review Schedule ──┼──▶  Blueprint Assembler        │
│  Gamification ─────┤                                │
│  AI Tutor Prompts ─┤                                │
│  Video Scripts ────┘                                │
└────────────────────────────┬───────────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │   QA VALIDATOR   │  ← Check all invariants
                   └────────┬─────────┘
                             │
                   ┌─────────┴──────────────────┐
                   │  Pass?                       │
                   │  YES → Cache + Return Output │
                   │  NO  → Log Issues + Retry    │
                   └──────────────────────────────┘
```

### 1.3 Microservice Boundaries

| Service | Responsibility | Tech Stack |
|---------|---------------|------------|
| `curriculum-api` | REST/GraphQL endpoint, auth, rate limit | Node.js + Fastify |
| `generator-core` | Pipeline orchestration, module coordination | Node.js + BullMQ |
| `knowledge-service` | Knowledge graph CRUD + query | Node.js + Neo4j/PostgreSQL |
| `ai-service` | AI model routing, prompt management, retries | Node.js + LangChain |
| `export-service` | JSON, Markdown, CSV, SCORM, DB seed | Node.js |
| `qa-service` | Invariant validation, QA report generation | Node.js |
| `cache-service` | Blueprint deduplication, hot cache | Redis |
| `topic-library-service` | Topic template CRUD, versioning | Node.js + PostgreSQL |

### 1.4 AI Model Integration Points (Overview)

```
Generator Core
     │
     ├──▶ [Topic Naming]         → GPT-4o-mini  (cheap, fast, creative)
     ├──▶ [Objective Writing]    → Claude Sonnet (SMART format, precise)
     ├──▶ [Prereq Inference]     → GPT-4o        (reasoning-heavy)
     ├──▶ [Difficulty Calibrate] → Claude Sonnet (nuanced judgment)
     └──▶ [AI Tutor Prompts]     → Claude Opus   (Socratic depth)
```

---

## 2. Core Data Structures

### 2.1 Input Parameters Schema

```typescript
// ============================================================
// INPUT: GeneratorInput
// ============================================================
interface GeneratorInput {
  // Course identity
  courseName: string;                          // min 3, max 120 chars
  subject: SubjectCode;                         // see enum below
  ageRange: { min: number; max: number };       // 5–18, min < max
  grade: number;                                // 1–12
  durationWeeks: number;                        // 4–52

  // Curriculum standard
  curriculum: CurriculumStandard;

  // Outcomes (required ≥ 3, max 20)
  learningOutcome: SmartObjective[];

  // Structure
  topicCount: number;                           // 5–50
  lessonsPerTopic: number;                      // 2–10

  // Difficulty
  difficultyProfile: DifficultyProfile;

  // Delivery
  deliveryMode: DeliveryMode;

  // Feature flags
  features: FeatureFlags;

  // Optional overrides
  hoursPerWeek?: number;                        // default: grade ≤ 5 → 3h, grade 6–9 → 4h, grade 10–12 → 5h
  targetAudience?: string;                      // additional learner context
  customKnowledgeBase?: KnowledgeNode[];        // for CUSTOM curriculum
}

// ============================================================
// ENUMS
// ============================================================
type SubjectCode =
  | "TOAN" | "TIENG_ANH" | "TIN_HOC" | "LAP_TRINH"
  | "VAN"  | "LY"        | "HOA"     | "SINH"
  | "SU"   | "DIA";

type CurriculumStandard =
  | "VIETNAM_MOE" | "SINGAPORE_MATH" | "CAMBRIDGE"
  | "COMMON_CORE" | "IB_PYP"         | "CUSTOM";

type DifficultyProfile =
  | "FOUNDATION"     // below grade level — remedial
  | "STANDARD"       // on grade level
  | "ADVANCED"       // above grade level
  | "HSG"            // gifted / olympiad track
  | "INTERNATIONAL"; // IB / Cambridge / SAT / AMC preparation

type DeliveryMode = "ONLINE" | "OFFLINE" | "BLENDED";

interface FeatureFlags {
  aiTutor:       boolean;   // AI Socratic tutor integration
  video:         boolean;   // video lesson scripts
  coding:        boolean;   // coding exercises (for TIN_HOC/LAP_TRINH)
  gamification:  boolean;   // XP, badges, leaderboard
  homework:      boolean;   // homework scheduling
  projects:      boolean;   // project-based learning units
  assessments:   boolean;   // quiz/test generation
  parentReports: boolean;   // parent-facing progress reports
}

type SmartObjective = string; // Must match: verb (Bloom) + content + standard + condition
```

### 2.2 CurriculumBlueprint — Master Output Schema

```typescript
// ============================================================
// OUTPUT: CurriculumBlueprint
// ============================================================
interface CurriculumBlueprint {
  // ── Identity ──────────────────────────────────────────────
  id:           string;           // uuid v4
  version:      string;           // semver, e.g. "1.0.0"
  paramsHash:   string;           // SHA-256 of serialized input (for cache dedup)
  generatedAt:  string;           // ISO 8601 timestamp
  generatedBy:  string;           // generator version + model versions

  // ── Metadata ──────────────────────────────────────────────
  metadata: BlueprintMetadata;

  // ── Roadmap & Map ─────────────────────────────────────────
  learningRoadmap:  LearningRoadmap;
  curriculumMap:    CurriculumMap;

  // ── Topic Structure ───────────────────────────────────────
  topicStructure: Topic[];

  // ── Dependency Graph ──────────────────────────────────────
  prerequisiteGraph: PrerequisiteGraph;
  knowledgeGraph:    KnowledgeGraph;

  // ── Progression ───────────────────────────────────────────
  skillProgression:        SkillProgression;
  thinkingSkillProgression: ThinkingSkillProgression;
  difficultyCurve:          DifficultyCurveData;

  // ── Plans ─────────────────────────────────────────────────
  assessmentPlan:  AssessmentPlan;
  homeworkPlan:    HomeworkPlan;
  gamificationPlan?: GamificationPlan;  // null if features.gamification = false
  reviewSchedule:  ReviewSchedule;

  // ── Certification ─────────────────────────────────────────
  certificateRequirements: CertificateRequirements;

  // ── QA Report ─────────────────────────────────────────────
  qaReport: QAReport;
}

// ── Metadata ──────────────────────────────────────────────────
interface BlueprintMetadata {
  courseName:        string;
  subject:           SubjectCode;
  grade:             number;
  ageRange:          { min: number; max: number };
  durationWeeks:     number;
  hoursPerWeek:      number;
  totalHours:        number;           // durationWeeks × hoursPerWeek
  curriculum:        CurriculumStandard;
  difficultyProfile: DifficultyProfile;
  deliveryMode:      DeliveryMode;
  topicCount:        number;           // actual generated count
  totalLessons:      number;
  learningOutcomes:  SmartObjective[];
  features:          FeatureFlags;
  tags:              string[];         // auto-generated from subject + grade + profile
}

// ── Learning Roadmap ──────────────────────────────────────────
interface LearningRoadmap {
  pathType:    "LINEAR" | "BRANCHING" | "SPIRAL";
  phases:      Phase[];
  milestones:  Milestone[];
  entryRequirements: string[];  // what learner should know before starting
  exitCompetencies:  string[];  // what learner can do upon completion
}

interface Phase {
  phaseId:     string;    // "PHASE-01"
  phaseName:   string;    // e.g. "Foundation", "Core Concepts", "Mastery"
  topicIds:    string[];
  durationWeeks: number;
  theme:       string;    // unifying conceptual theme
  objectives:  string[];
}

interface Milestone {
  milestoneId:  string;
  name:         string;
  afterTopicId: string;   // milestone is reached after this topic
  description:  string;
  evidence:     string;   // how learner demonstrates achievement
}

// ── Curriculum Map ─────────────────────────────────────────────
interface CurriculumMap {
  // Cross-reference: curriculum standard → topic → learning outcome
  standardAlignments: StandardAlignment[];
  // Big ideas / enduring understandings (UbD Stage 1)
  bigIdeas: string[];
  // Essential questions (UbD Stage 1)
  essentialQuestions: string[];
}

interface StandardAlignment {
  standard:      CurriculumStandard;
  standardCode:  string;   // e.g. "CCSS.Math.Content.3.OA.A.1"
  topicIds:      string[];
  outcomeIds:    string[];
}
```

### 2.3 Prerequisite Graph Schema

```typescript
interface PrerequisiteGraph {
  nodes: PrerequisiteNode[];
  edges: PrerequisiteEdge[];
  topologicalOrder: string[];    // topicIds in valid teaching order
  levels: GraphLevel[];          // breadth-first layers
  circularDependencies: string[][];  // empty array = clean DAG
}

interface PrerequisiteNode {
  topicId:    string;
  inDegree:   number;  // number of incoming prerequisite edges
  outDegree:  number;  // number of topics that depend on this
  layer:      number;  // 0 = no prerequisites (entry topics)
}

interface PrerequisiteEdge {
  from:     string;   // prerequisite topicId
  to:       string;   // dependent topicId
  strength: "REQUIRED" | "RECOMMENDED" | "OPTIONAL";
  // REQUIRED   = cannot proceed without mastery
  // RECOMMENDED = strong benefit but not blocking
  // OPTIONAL    = enrichment connection
}

interface GraphLevel {
  level:    number;
  topicIds: string[];  // topics at this dependency depth
}
```

### 2.4 Knowledge Graph Schema

```typescript
interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

interface KnowledgeNode {
  nodeId:     string;      // "KN-TOAN-G05-FRACTION-001"
  concept:    string;      // "Phân số"
  subject:    SubjectCode;
  gradeLevel: number;
  importance: "CORE" | "SUPPORTING" | "ENRICHMENT";
  bloomLevel: BloomLevel;  // lowest Bloom level where this concept is tested
  topicIds:   string[];    // which topics cover this concept
}

interface KnowledgeEdge {
  fromId:    string;
  toId:      string;
  relation:  "PREREQUISITE" | "GENERALIZES" | "APPLIES_TO" | "CONTRASTS_WITH" | "PART_OF";
  weight:    number;  // 0.0–1.0, strength of relationship
}

type BloomLevel =
  | "REMEMBER" | "UNDERSTAND" | "APPLY"
  | "ANALYZE"  | "EVALUATE"   | "CREATE";
```

### 2.5 Skill Progression Schema

```typescript
interface SkillProgression {
  // Tracks how specific skills develop across topics
  progressionChains: SkillChain[];
}

interface SkillChain {
  skillName:  string;
  topicMilestones: {
    topicId: string;
    level:   "INTRODUCED" | "DEVELOPING" | "CONSOLIDATING" | "MASTERED";
    descriptor: string;  // what mastery looks like at this point
  }[];
}

interface ThinkingSkillProgression {
  // Maps Bloom's taxonomy distribution across the course arc
  targetDistribution: BloomDistribution;  // end-of-course target
  phaseDistributions: {
    phaseId: string;
    distribution: BloomDistribution;
  }[];
}

interface BloomDistribution {
  remember:   number;  // % of learning activities at this level (sums to 100)
  understand: number;
  apply:      number;
  analyze:    number;
  evaluate:   number;
  create:     number;
}

interface DifficultyCurveData {
  profile:         DifficultyProfile;
  formula:         string;  // human-readable formula
  kParameter:      number;  // sigmoid steepness
  midpointTopic:   number;  // topic index at inflection point
  values:          number[];// difficulty score per topic (1.0–10.0)
  minDifficulty:   number;
  maxDifficulty:   number;
}
```

### 2.6 Assessment Plan Schema

```typescript
interface AssessmentPlan {
  philosophy:    string;     // e.g. "Assessment for Learning"
  overallRatio:  { formative: number; summative: number }; // e.g. 70/30
  formativeItems:  FormativeAssessment[];
  summativeItems:  SummativeAssessment[];
  finalAssessment: FinalAssessment;
  gradingRubric:   GradingRubric;
  calendar:        AssessmentCalendarEntry[];
}

interface FormativeAssessment {
  assessmentId: string;
  type:  "EXIT_TICKET" | "QUIZ" | "PEER_REVIEW" | "SELF_CHECK" | "OBSERVATION";
  topicId:      string;
  lessonId:     string;
  durationMins: number;
  questionCount: number;
  bloomLevels:   BloomLevel[];
  autoGraded:    boolean;
}

interface SummativeAssessment {
  assessmentId:  string;
  type:  "MODULE_TEST" | "PROJECT" | "PRESENTATION" | "PORTFOLIO";
  afterTopicIds: string[];  // triggered after completing these topics
  durationMins:  number;
  questionCount: number;
  bloomLevels:   BloomLevel[];
  weight:        number;    // % of final grade
}

interface FinalAssessment {
  type:         "EXAM" | "CAPSTONE_PROJECT" | "PORTFOLIO_DEFENSE";
  durationMins: number;
  topicsCovered: string[];  // all topicIds
  weight:        number;
  passingScore:  number;    // e.g. 70
}

interface GradingRubric {
  scale:    "100" | "10" | "LETTER" | "PROFICIENCY";
  bands: { label: string; min: number; max: number; descriptor: string }[];
}

interface AssessmentCalendarEntry {
  week:          number;
  assessmentId:  string;
  type:          string;
  topicId?:      string;
  description:   string;
}
```

### 2.7 Homework Plan Schema

```typescript
interface HomeworkPlan {
  weeklySchedule: WeeklyHomework[];
  totalWeeks:     number;
  avgMinutesPerDay: number;
  reviewRatio:    number;  // 0.6–0.8 (review content)
  newContentRatio: number; // 0.2–0.4 (new content preview)
}

interface WeeklyHomework {
  week:          number;
  topicId:       string;
  dailyAssignments: DailyAssignment[];
  weeklyQuestionCount: number;
}

interface DailyAssignment {
  day:           "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
  durationMins:  number;
  questionCount: number;
  type:          "REVIEW" | "NEW_CONTENT" | "CHALLENGE" | "CREATIVE";
  topicsReviewed: string[];  // topicIds being reviewed
}
```

### 2.8 Gamification Plan Schema

```typescript
interface GamificationPlan {
  xpSystem: XPSystem;
  badges:   Badge[];
  levels:   PlayerLevel[];
  streaks:  StreakConfig;
  leaderboard: LeaderboardConfig;
}

interface XPSystem {
  lessonComplete:    number;  // XP awarded
  homeworkComplete:  number;
  quizPerfect:       number;
  streakBonus:       number;  // per day
  challengeBonus:    number;
  earlySubmission:   number;
}

interface Badge {
  badgeId:     string;
  name:        string;
  description: string;
  icon:        string;    // emoji or asset key
  trigger:     string;    // condition expression
  rarity:      "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
}

interface PlayerLevel {
  level:       number;
  title:       string;   // e.g. "Học sinh Nhí", "Chiến binh Toán"
  minXP:       number;
  maxXP:       number;
  rewards:     string[];
}

interface StreakConfig {
  dailyStreakBonus:   number;   // XP per consecutive day
  weeklyStreakBadge:  string;   // badgeId awarded at 7-day streak
  maxStreakMultiplier: number;  // cap on XP multiplier
}

interface LeaderboardConfig {
  scope:       "CLASS" | "SCHOOL" | "PLATFORM";
  refreshRate: "DAILY" | "WEEKLY";
  topN:        number;   // show top N learners
  anonymous:   boolean;  // privacy option
}
```

### 2.9 Review Schedule Schema

```typescript
interface ReviewSchedule {
  algorithm:    "EBBINGHAUS_SPACED" | "SM2" | "ANKI_CUSTOM";
  intervals:    number[];  // e.g. [1, 3, 7, 14, 30] (days)
  topicReviews: TopicReviewPlan[];
  totalReviewSessions: number;
}

interface TopicReviewPlan {
  topicId:     string;
  firstTaught: number;     // week number
  reviewSessions: ReviewSession[];
}

interface ReviewSession {
  sessionId:   string;
  scheduledDay: number;    // absolute day from course start
  week:         number;
  type:         "MICRO_REVIEW" | "FULL_REVIEW" | "MIXED_REVIEW";
  durationMins: number;
  questionCount: number;
}
```

### 2.10 Certificate Requirements Schema

```typescript
interface CertificateRequirements {
  name:          string;
  issuedBy:      string;   // "AvaB Education Platform"
  requirements: {
    minAttendance:    number;  // e.g. 0.8 = 80%
    minHomeworkRate:  number;  // e.g. 0.75
    minFinalScore:    number;  // e.g. 70
    minModuleScore:   number;  // e.g. 60 per module
    requiredBadges:   string[];
    requiredProjects: string[];
  };
  competenciesGranted: string[];
  validityPeriod:      string;  // e.g. "Lifetime" or "3 years"
}
```

---

## 3. Topic Structure Schema

```typescript
// ============================================================
// TOPIC — The fundamental unit of the curriculum
// ============================================================
interface Topic {
  // ── Identity ──────────────────────────────────────────────
  topicId:      string;   // Format: "TOAN-G05-T001" (SUBJECT-GRADE-SEQ)
  topicName:    string;
  topicNameEn?: string;   // English equivalent for international standards
  sequenceIndex: number;  // 1-based position in overall course

  // ── Objectives (Backward Design Stage 1) ──────────────────
  objectives:      SmartObjective[];   // 2–5 SMART objectives
  bigIdea:         string;             // one enduring understanding
  essentialQuestion: string;           // one driving question

  // ── Content ───────────────────────────────────────────────
  knowledge:       KnowledgePoint[];   // declarative knowledge
  skills:          SkillTarget[];      // procedural skills
  thinkingSkills:  ThinkingSkillTarget[]; // Bloom + SOLO taxonomy

  // ── Time & Placement ──────────────────────────────────────
  durationHours:   number;
  startWeek:       number;
  endWeek:         number;
  phase:           string;  // phaseId

  // ── Dependencies ──────────────────────────────────────────
  prerequisites:   string[];  // topicId[] — REQUIRED prerequisites
  recommendedPrereqs: string[]; // topicId[] — RECOMMENDED prerequisites
  enables:         string[];  // topicId[] — what this topic unlocks

  // ── Sub-components ────────────────────────────────────────
  lessons:      Lesson[];
  homework:     HomeworkPlan;       // scoped to this topic
  assessment:   TopicAssessment;
  aiTutorPlan?: AITutorPlan;       // null if features.aiTutor = false
  gamification?: TopicGamification;// null if features.gamification = false
  video?:       VideoPlan;         // null if features.video = false
  worksheets:   WorksheetPlan;

  // ── Metadata ──────────────────────────────────────────────
  difficulty:   number;    // 1.0–10.0, from difficulty curve
  bloomTarget:  BloomLevel; // highest Bloom level expected at mastery
  soloTarget:   SOLOLevel;
  tags:         string[];
  alignedStandards: string[]; // e.g. ["CCSS.Math.Content.5.NF.A.1"]
}

// ── Knowledge Points ──────────────────────────────────────────
interface KnowledgePoint {
  id:          string;
  description: string;         // "Hiểu khái niệm phân số như một phần của một toàn thể"
  type:        "FACT" | "CONCEPT" | "PRINCIPLE" | "PROCEDURE" | "METACOGNITION";
  bloomLevel:  BloomLevel;
  mandatory:   boolean;
}

// ── Skill Targets ─────────────────────────────────────────────
interface SkillTarget {
  id:          string;
  skillName:   string;
  descriptor:  string;         // "Cộng được hai phân số cùng mẫu"
  type:        "COGNITIVE" | "PROCEDURAL" | "SOCIAL" | "METACOGNITIVE" | "DIGITAL";
  masteryIndicator: string;    // observable evidence of mastery
}

// ── Thinking Skill Targets ────────────────────────────────────
interface ThinkingSkillTarget {
  bloomLevel:  BloomLevel;
  soloLevel:   SOLOLevel;
  activity:    string;   // "Học sinh phân tích sự khác nhau giữa các loại phân số"
  verb:        string;   // action verb from Bloom taxonomy
}

type SOLOLevel =
  | "PRESTRUCTURAL"  // no understanding
  | "UNISTRUCTURAL"  // one relevant aspect
  | "MULTISTRUCTURAL"// many aspects, no connection
  | "RELATIONAL"     // aspects integrated
  | "EXTENDED_ABSTRACT"; // generalized beyond the task

// ── Lesson ────────────────────────────────────────────────────
interface Lesson {
  lessonId:     string;  // "TOAN-G05-T001-L01"
  lessonName:   string;
  sequenceIndex: number; // within topic
  type:  "INTRODUCTION" | "CORE_CONTENT" | "PRACTICE" | "REVIEW"
       | "ASSESSMENT" | "PROJECT" | "ENRICHMENT";
  durationMins:  number;
  objectives:    string[];  // subset of topic objectives
  activities:    Activity[];
  resources:     Resource[];
  deliveryNotes: string;    // tips for teacher or AI tutor
}

interface Activity {
  activityId:  string;
  name:        string;
  type:  "DIRECT_INSTRUCTION" | "GUIDED_PRACTICE" | "INDEPENDENT_PRACTICE"
       | "COLLABORATIVE" | "DISCUSSION" | "GAME" | "REFLECTION";
  durationMins: number;
  bloomLevel:   BloomLevel;
  instructions: string;      // step-by-step
  materials:    string[];
}

interface Resource {
  resourceId: string;
  type:  "VIDEO" | "WORKSHEET" | "MANIPULATIVE" | "DIGITAL_TOOL"
       | "BOOK_REFERENCE" | "EXTERNAL_LINK";
  title:      string;
  url?:       string;
  pageRef?:   string;
}

// ── Topic Assessment ──────────────────────────────────────────
interface TopicAssessment {
  formative: FormativeAssessment[];
  summative?: SummativeAssessment;  // one per topic, optional
  exitTicket: {
    questionCount: number;
    durationMins:  number;
    bloomLevels:   BloomLevel[];
  };
}

// ── AI Tutor Plan ─────────────────────────────────────────────
interface AITutorPlan {
  personaName:     string;    // e.g. "Ava" (AI tutor name)
  socraticPrompts: SocraticPrompt[];
  scaffoldingSteps: string[]; // progressive hints
  commonMisconceptions: Misconception[];
  adaptationRules: AdaptationRule[];
}

interface SocraticPrompt {
  triggerCondition: string;  // "student_stuck_on_step_2"
  prompt:           string;
  followUpIfCorrect: string;
  followUpIfWrong:  string;
}

interface Misconception {
  description:   string;
  detectPattern: string;  // regex or semantic match hint
  correction:    string;
  tutorResponse: string;
}

interface AdaptationRule {
  condition:   string;  // e.g. "score < 60% on exit ticket"
  action:      "SLOW_DOWN" | "SKIP_AHEAD" | "REVIEW_PREREQ" | "ADD_SCAFFOLD";
  instruction: string;
}

// ── Video Plan ────────────────────────────────────────────────
interface VideoPlan {
  videos: VideoSpec[];
}

interface VideoSpec {
  videoId:      string;
  title:        string;
  lessonId:     string;
  durationMins: number;
  scriptOutline: ScriptSection[];
  visualNotes:  string;  // animation / whiteboard guidance
  voiceOver:    boolean;
  captionLangs: string[]; // e.g. ["vi", "en"]
}

interface ScriptSection {
  sectionName:  string;
  durationMins: number;
  content:      string;  // narration outline
  visualCue:    string;  // what appears on screen
}

// ── Worksheet Plan ────────────────────────────────────────────
interface WorksheetPlan {
  worksheets: WorksheetSpec[];
}

interface WorksheetSpec {
  worksheetId:   string;
  title:         string;
  lessonId:      string;
  questionCount: number;
  sections: {
    sectionName:   string;
    bloomLevel:    BloomLevel;
    questionCount: number;
    questionTypes: ("MCQ" | "SHORT_ANSWER" | "LONG_ANSWER" | "MATCHING" | "TRUE_FALSE" | "FILL_IN")[];
  }[];
  estimatedMins: number;
  solution:      boolean;  // whether to generate answer key
}

// ── Topic Gamification ────────────────────────────────────────
interface TopicGamification {
  xpReward:      number;   // XP for completing topic
  badges:        string[]; // badgeIds earnable in this topic
  miniGame?:     string;   // optional mini-game key
  challengeMode: boolean;  // unlock after normal completion
  leaderboardContribution: boolean;
}
```

---

## 4. Generator Algorithms

### 4.1 Learning Roadmap Generator

**Purpose:** Convert high-level learning outcomes into a sequenced topic roadmap using Backward Design (Understanding by Design — Wiggins & McTighe).

**Three-Stage Backward Design Process:**
```
Stage 1: DESIRED RESULTS
  ├── Identify Big Ideas (enduring understandings)
  ├── Formulate Essential Questions
  └── Define SMART Learning Outcomes

Stage 2: ACCEPTABLE EVIDENCE
  ├── Define what mastery looks like
  ├── Plan summative assessments
  └── Define formative checkpoints

Stage 3: LEARNING EXPERIENCES
  ├── Design topic sequence to reach Stage 1 via Stage 2
  ├── Apply spiral curriculum (Bruner)
  └── Sequence for prerequisite flow
```

**Pseudocode:**
```
FUNCTION generateRoadmap(input: GeneratorInput) → LearningRoadmap:

  // Step 1: Parse outcomes into knowledge/skill clusters
  clusters = clusterOutcomes(input.learningOutcome)
    // Group semantically similar outcomes
    // Tag each with Bloom level via NLP

  // Step 2: Identify path type
  IF input.topicCount ≤ 10 THEN
    pathType = LINEAR
  ELSE IF hasMajorBranches(clusters) THEN
    pathType = BRANCHING
  ELSE
    pathType = SPIRAL   // default for most academic subjects

  // Step 3: Map outcomes to phases
  phases = []
  phaseCount = ceil(input.topicCount / 8)  // ~8 topics per phase
  FOR i IN 1..phaseCount:
    phase = {
      phaseName: getPhaseName(i, phaseCount, input.subject),
      // Phase 1: Foundation, Phase 2: Core, ..., Last: Mastery
      topicCount: distributeTopics(i, phaseCount, input.topicCount),
      bloomTarget: getPhaseBloomTarget(i, phaseCount)
      // Earlier phases: Remember/Understand
      // Middle phases: Apply/Analyze
      // Final phases: Evaluate/Create
    }
    phases.append(phase)

  // Step 4: Place milestones
  milestones = []
  FOR EACH phase boundary:
    milestone = createMilestone(phase, outcomes)
  milestones.append(finalMilestone(exitCompetencies))

  RETURN LearningRoadmap { pathType, phases, milestones }
```

**Flowchart:**
```
START
  │
  ▼
Parse Learning Outcomes
  │
  ▼
Cluster by Semantic Similarity ──────────────────┐
  │                                               │
  ▼                                               │
Detect Bloom Levels per Cluster                   │
  │                                               │
  ▼                                               ▼
Has branching points?       [YES] → Mark Branch Nodes
  │[NO]                                           │
  ▼                                               ▼
topicCount ≤ 10?            [YES] → LINEAR      BRANCHING path
  │[NO]                                           │
  ▼                                               │
Use SPIRAL path  ◀──────────────────────────────┘
  │
  ▼
Distribute topics across phases
  │
  ▼
Place milestones at phase boundaries
  │
  ▼
Define entry requirements + exit competencies
  │
  ▼
RETURN LearningRoadmap
```

---

### 4.2 Prerequisite Graph Builder

**Purpose:** Build a Directed Acyclic Graph (DAG) representing knowledge dependencies. Ensures topics are taught in valid learning order.

**Algorithm: Topological Sort (Kahn's Algorithm) + Cycle Detection**

```
FUNCTION buildPrerequisiteGraph(topics: Topic[], knowledgeGraph: KnowledgeGraph) → PrerequisiteGraph:

  // Step 1: Build initial edges from knowledge graph
  edges = []
  FOR EACH knowledgeEdge IN knowledgeGraph.edges WHERE relation = "PREREQUISITE":
    fromTopic = findTopicContainingNode(knowledgeEdge.fromId)
    toTopic   = findTopicContainingNode(knowledgeEdge.toId)
    IF fromTopic ≠ toTopic:
      edges.append({ from: fromTopic.topicId, to: toTopic.topicId, strength: "REQUIRED" })

  // Step 2: AI-infer missing prerequisites (if enabled)
  inferredEdges = aiInferPrerequisites(topics, existingEdges)
  edges = merge(edges, inferredEdges)

  // Step 3: Cycle Detection (DFS)
  cycles = detectCycles(nodes, edges)
  IF cycles.length > 0:
    FOR EACH cycle:
      // Break weakest edge in cycle
      weakestEdge = cycle.edges.minBy(e => e.strength == "OPTIONAL" ? 0 : 1)
      edges.remove(weakestEdge)
      logWarning("Circular prerequisite broken: " + cycle)

  // Step 4: Topological Sort (Kahn's)
  inDegree = Map<topicId, number>
  FOR EACH edge IN edges:
    inDegree[edge.to] += 1

  queue = [topics WHERE inDegree[t] == 0]  // start nodes
  topologicalOrder = []

  WHILE queue NOT EMPTY:
    node = queue.dequeue()
    topologicalOrder.append(node.topicId)
    FOR EACH dependent IN neighbors(node):
      inDegree[dependent] -= 1
      IF inDegree[dependent] == 0:
        queue.enqueue(dependent)

  IF topologicalOrder.length < topics.length:
    // Remaining nodes are in a cycle that wasn't fully resolved
    THROW PrerequisiteGraphError("Unresolved cycles remain")

  // Step 5: Compute levels (BFS layer assignment)
  levels = computeBFSLevels(nodes, edges)

  RETURN PrerequisiteGraph { nodes, edges, topologicalOrder, levels, circularDependencies: cycles }
```

**Cycle Detection (DFS):**
```
FUNCTION detectCycles(nodes, edges) → string[][]  // list of cycle paths

  visited = Set()
  recStack = Set()
  cycles = []

  FUNCTION dfs(node, path):
    visited.add(node)
    recStack.add(node)
    path.push(node)

    FOR EACH neighbor OF node:
      IF neighbor NOT IN visited:
        dfs(neighbor, path)
      ELSE IF neighbor IN recStack:
        cycleStart = path.indexOf(neighbor)
        cycles.append(path.slice(cycleStart))

    recStack.remove(node)
    path.pop()

  FOR EACH node IN nodes:
    IF node NOT IN visited:
      dfs(node, [])

  RETURN cycles
```

---

### 4.3 Difficulty Curve Generator

**Purpose:** Assign a difficulty score (1.0–10.0) to each topic in sequence, following an S-curve (sigmoid) distribution to avoid overwhelming learners early or boring them in the middle.

**Formula:**
```
difficulty(n) = D_min + (D_max - D_min) × sigmoid((n - n_mid) / k)

where:
  n      = topic sequence index (0-based)
  n_mid  = topicCount / 2  (inflection point)
  k      = steepness parameter (profile-dependent)
  sigmoid(x) = 1 / (1 + e^(-x))

  D_min, D_max, k by profile:
  ┌──────────────┬──────────┬──────────┬──────┐
  │ Profile      │ D_min    │ D_max    │  k   │
  ├──────────────┼──────────┼──────────┼──────┤
  │ FOUNDATION   │  1.0     │  4.0     │ 3.0  │
  │ STANDARD     │  2.0     │  7.0     │ 2.5  │
  │ ADVANCED     │  3.0     │  9.0     │ 2.0  │
  │ HSG          │  5.0     │ 10.0     │ 1.5  │
  │ INTERNATIONAL│  4.0     │ 10.0     │ 2.0  │
  └──────────────┴──────────┴──────────┴──────┘
```

**Pseudocode:**
```
FUNCTION generateDifficultyCurve(input: GeneratorInput) → DifficultyCurveData:

  { D_min, D_max, k } = PROFILE_PARAMS[input.difficultyProfile]
  n_mid = input.topicCount / 2
  values = []

  FOR n IN 0..input.topicCount - 1:
    x = (n - n_mid) / k
    sigmoid_x = 1 / (1 + Math.exp(-x))
    d = D_min + (D_max - D_min) * sigmoid_x
    values.append(round(d, 1))

  // Validation: no sudden jump > 2.0 between consecutive topics
  FOR i IN 1..values.length - 1:
    IF values[i] - values[i-1] > 2.0:
      // Smooth by averaging with neighbors
      values[i] = (values[i-1] + values[i] + values[i+1]) / 3

  RETURN DifficultyCurveData {
    profile: input.difficultyProfile,
    formula: "D_min + (D_max - D_min) × sigmoid((n - n_mid) / k)",
    kParameter: k,
    midpointTopic: floor(n_mid),
    values,
    minDifficulty: min(values),
    maxDifficulty: max(values)
  }
```

**Visual Example (STANDARD profile, 10 topics):**
```
Difficulty
10 │
 9 │                                          ●
 8 │                               ●
 7 │                          ●         ●
 6 │                     ●
 5 │                ●
 4 │          ●
 3 │    ●
 2 │●
 1 │
   └────────────────────────────────────────────
     T1  T2  T3  T4  T5  T6  T7  T8  T9  T10
```

---

### 4.4 Lesson Sequencer

**Purpose:** Order lessons within and across topics using interleaving and spaced repetition principles to maximize retention.

**Algorithm: Interleaved Practice + Spaced Repetition**

```
FUNCTION sequenceLessons(topics: Topic[], deliveryMode: DeliveryMode) → OrderedLesson[]:

  allLessons = []
  reviewBuffer = []   // lessons due for review

  FOR EACH topic IN topologicalOrder:
    // Core lesson sequence within topic
    lessonTypes = buildLessonTypeSequence(topic.lessonsPerTopic)
    // Standard pattern: INTRO → CORE → CORE → PRACTICE → PRACTICE → ... → ASSESSMENT

    FOR EACH lessonType IN lessonTypes:
      lesson = createLesson(topic, lessonType)
      allLessons.append(lesson)

      // Schedule review of previously seen topics (interleaving)
      reviewCandidates = getTopicsReadyForReview(reviewBuffer, currentDay)
      FOR EACH reviewTopic IN reviewCandidates.first(2):  // max 2 interleaved reviews per session
        reviewLesson = createReviewLesson(reviewTopic)
        allLessons.append(reviewLesson)

    // After topic completion, schedule spaced reviews
    FOR interval IN [1, 3, 7, 14, 30]:  // days
      reviewBuffer.append({ topicId: topic.topicId, reviewDay: currentDay + interval })

  RETURN allLessons

FUNCTION buildLessonTypeSequence(count: number) → LessonType[]:
  // Ensure every topic has:
  // - 1 INTRODUCTION lesson
  // - ≥1 CORE_CONTENT lesson
  // - ≥1 PRACTICE lesson
  // - 1 ASSESSMENT lesson (exit ticket)
  
  sequence = [INTRODUCTION]
  coreCount = max(1, floor(count * 0.4))
  practiceCount = max(1, floor(count * 0.4))
  reviewCount = count - 1 - coreCount - practiceCount - 1  // remainder
  
  sequence += repeat(CORE_CONTENT, coreCount)
  sequence += repeat(PRACTICE, practiceCount)
  IF reviewCount > 0: sequence += repeat(REVIEW, reviewCount)
  sequence += [ASSESSMENT]
  
  RETURN sequence
```

---

### 4.5 Assessment Plan Generator

**Purpose:** Create a balanced assessment calendar with 70% formative / 30% summative distribution, covering all Bloom levels.

```
FUNCTION generateAssessmentPlan(input: GeneratorInput, topics: Topic[]) → AssessmentPlan:

  formativeItems = []
  summativeItems = []

  // Formative: exit ticket per lesson + quiz per topic
  FOR EACH topic IN topics:
    // Exit ticket at end of each lesson
    FOR EACH lesson IN topic.lessons WHERE lesson.type ≠ REVIEW:
      exitTicket = {
        type: EXIT_TICKET,
        topicId: topic.topicId,
        lessonId: lesson.lessonId,
        durationMins: 5,
        questionCount: 3,
        bloomLevels: [REMEMBER, UNDERSTAND]
      }
      formativeItems.append(exitTicket)

    // Topic quiz (Bloom levels: UNDERSTAND + APPLY)
    topicQuiz = {
      type: QUIZ,
      topicId: topic.topicId,
      durationMins: 15,
      questionCount: 10,
      bloomLevels: [UNDERSTAND, APPLY, ANALYZE]
    }
    formativeItems.append(topicQuiz)

  // Summative: one per phase (every ~8 topics)
  FOR EACH phase IN phases:
    module_test = {
      type: MODULE_TEST,
      afterTopicIds: phase.topicIds,
      durationMins: 45,
      questionCount: 25,
      bloomLevels: [REMEMBER, UNDERSTAND, APPLY, ANALYZE, EVALUATE],
      weight: summativeWeight / phases.length
    }
    summativeItems.append(module_test)

  // Final assessment
  finalAssessment = {
    type: input.features.projects ? CAPSTONE_PROJECT : EXAM,
    durationMins: 90,
    topicsCovered: ALL topics,
    weight: 0.30,
    passingScore: 70
  }

  // Build calendar
  calendar = placeOnCalendar(formativeItems, summativeItems, finalAssessment, input.durationWeeks)

  // Validate Bloom coverage
  validateBloomCoverage(formativeItems + summativeItems)
  // Ensures all 6 Bloom levels appear at least once in summative

  RETURN AssessmentPlan { formativeItems, summativeItems, finalAssessment, calendar }
```

---

### 4.6 Homework Plan Generator

**Purpose:** Create weekly homework that maintains 60-80% review content and 20-40% new content, calibrated to grade level time constraints.

```
FUNCTION generateHomeworkPlan(input: GeneratorInput, topics: Topic[]) → HomeworkPlan:

  // Time budget by grade
  maxMinutesPerDay = getMaxHomeworkMins(input.grade)
  // Grade 1-3: 20 min/day, Grade 4-6: 30 min, Grade 7-9: 45 min, Grade 10-12: 60 min

  activeDays = input.deliveryMode == "ONLINE" ? 5 : 5
  weeklySchedule = []

  recentTopics = []  // rolling window of last 10 taught topics

  FOR week IN 1..input.durationWeeks:
    currentTopic = getTopicForWeek(topics, week)
    recentTopics.prepend(currentTopic)
    IF recentTopics.length > 10: recentTopics.pop()

    dailyAssignments = []
    FOR EACH day IN activeDays:
      reviewTopics = sampleWeighted(recentTopics, count=2, weightByRecency=true)

      assignment = {
        day: day,
        durationMins: maxMinutesPerDay,
        type: day IN [MON, WED, FRI] ? REVIEW : NEW_CONTENT,
        topicsReviewed: reviewTopics.map(t => t.topicId),
        questionCount: floor(maxMinutesPerDay / 3)  // ~3 min per question
      }
      dailyAssignments.append(assignment)

    weeklySchedule.append({
      week, topicId: currentTopic.topicId, dailyAssignments,
      weeklyQuestionCount: sum(dailyAssignments.map(d => d.questionCount))
    })

  reviewRatio = 0.70  // target
  RETURN HomeworkPlan { weeklySchedule, totalWeeks, avgMinutesPerDay, reviewRatio, newContentRatio: 0.30 }
```

---

### 4.7 Review Schedule Generator

**Purpose:** Apply Ebbinghaus forgetting curve to schedule optimal review sessions for each topic, ensuring all content is reviewed within 30 days of initial learning.

```
FUNCTION generateReviewSchedule(topics: Topic[], startDate: number) → ReviewSchedule:

  EBBINGHAUS_INTERVALS = [1, 3, 7, 14, 30]  // days after initial learning
  topicReviews = []

  FOR EACH topic IN topics:
    firstTaughtDay = topic.startWeek * 7
    reviewSessions = []

    FOR EACH interval IN EBBINGHAUS_INTERVALS:
      reviewDay = firstTaughtDay + interval
      
      // Determine review type based on interval
      type = MICRO_REVIEW IF interval ≤ 3
           ELSE FULL_REVIEW IF interval == 7
           ELSE MIXED_REVIEW  // 14, 30 days = mixed with other topics

      session = {
        sessionId: generateId(),
        scheduledDay: reviewDay,
        week: ceil(reviewDay / 7),
        type,
        durationMins: interval ≤ 3 ? 10 : interval ≤ 7 ? 20 : 30,
        questionCount: interval ≤ 3 ? 5 : interval ≤ 7 ? 10 : 15
      }
      reviewSessions.append(session)

    topicReviews.append({ topicId: topic.topicId, firstTaught: topic.startWeek, reviewSessions })

  // Verify: every topic has at least one review within 30 days
  FOR EACH topicReview IN topicReviews:
    maxDay = topicReview.reviewSessions.max(s => s.scheduledDay)
    IF maxDay - topicReview.firstTaught*7 > 30:
      logWarning("Topic " + topicReview.topicId + " may not be reviewed within 30 days")

  RETURN ReviewSchedule {
    algorithm: "EBBINGHAUS_SPACED",
    intervals: EBBINGHAUS_INTERVALS,
    topicReviews,
    totalReviewSessions: sum(topicReviews.map(t => t.reviewSessions.length))
  }
```

---

## 5. Database Design

### 5.1 Full Schema (PostgreSQL)

```sql
-- ============================================================
-- CURRICULUM BLUEPRINTS (generated output cache)
-- ============================================================
CREATE TABLE curriculum_blueprints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  params_hash     CHAR(64) NOT NULL UNIQUE,  -- SHA-256 of input params
  input_params    JSONB    NOT NULL,
  blueprint_json  JSONB    NOT NULL,
  version         VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- draft | published | archived | deprecated
  generated_by    VARCHAR(100),  -- model versions used
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,   -- null = never expires
  
  CONSTRAINT blueprint_status_check CHECK (
    status IN ('draft', 'published', 'archived', 'deprecated')
  )
);

CREATE INDEX idx_blueprint_hash    ON curriculum_blueprints(params_hash);
CREATE INDEX idx_blueprint_status  ON curriculum_blueprints(status);
CREATE INDEX idx_blueprint_subject ON curriculum_blueprints((input_params->>'subject'));
CREATE INDEX idx_blueprint_grade   ON curriculum_blueprints((input_params->>'grade'));

-- ============================================================
-- TOPIC LIBRARY (reusable topic templates)
-- ============================================================
CREATE TABLE topic_library (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_code      VARCHAR(50) NOT NULL UNIQUE, -- "TOAN-G05-FRACTION-001"
  subject         VARCHAR(20) NOT NULL,
  grade_level     SMALLINT NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
  name_vi         VARCHAR(200) NOT NULL,
  name_en         VARCHAR(200),
  knowledge_json  JSONB NOT NULL DEFAULT '[]',  -- KnowledgePoint[]
  skills_json     JSONB NOT NULL DEFAULT '[]',  -- SkillTarget[]
  bloom_target    VARCHAR(30) NOT NULL,
  solo_target     VARCHAR(30) NOT NULL,
  difficulty_base DECIMAL(4,1) NOT NULL CHECK (difficulty_base BETWEEN 1.0 AND 10.0),
  duration_hours  DECIMAL(4,1) NOT NULL,
  tags            TEXT[] DEFAULT '{}',
  aligned_standards TEXT[] DEFAULT '{}',  -- curriculum codes
  usage_count     INTEGER DEFAULT 0,
  quality_score   DECIMAL(4,2),           -- 0.00–5.00, from ratings
  version         INTEGER DEFAULT 1,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_topic_lib_subject  ON topic_library(subject);
CREATE INDEX idx_topic_lib_grade    ON topic_library(grade_level);
CREATE INDEX idx_topic_lib_active   ON topic_library(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_topic_lib_tags     ON topic_library USING GIN(tags);
CREATE INDEX idx_topic_lib_stds     ON topic_library USING GIN(aligned_standards);

-- ============================================================
-- TOPIC PREREQUISITES (prerequisite graph edges)
-- ============================================================
CREATE TABLE topic_prerequisites (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id           UUID NOT NULL REFERENCES topic_library(id) ON DELETE CASCADE,
  prerequisite_id    UUID NOT NULL REFERENCES topic_library(id) ON DELETE CASCADE,
  strength           VARCHAR(20) NOT NULL DEFAULT 'REQUIRED',
    -- REQUIRED | RECOMMENDED | OPTIONAL
  confidence         DECIMAL(4,2) DEFAULT 1.0, -- 0.0–1.0, from AI inference
  source             VARCHAR(20) DEFAULT 'MANUAL',
    -- MANUAL | AI_INFERRED | CURRICULUM_STANDARD
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT prereq_no_self_loop CHECK (topic_id != prerequisite_id),
  CONSTRAINT prereq_strength_check CHECK (strength IN ('REQUIRED', 'RECOMMENDED', 'OPTIONAL')),
  UNIQUE(topic_id, prerequisite_id)
);

CREATE INDEX idx_prereq_topic ON topic_prerequisites(topic_id);
CREATE INDEX idx_prereq_prereq ON topic_prerequisites(prerequisite_id);

-- ============================================================
-- GENERATED COURSES (live course instances from blueprints)
-- ============================================================
CREATE TABLE generated_courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id    UUID NOT NULL REFERENCES curriculum_blueprints(id),
  course_id       UUID,               -- FK to avab.vn courses table
  name            VARCHAR(200) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'generating',
    -- generating | ready | failed | published
  error_log       JSONB DEFAULT '[]',
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  published_at    TIMESTAMPTZ,
  
  CONSTRAINT course_status_check CHECK (
    status IN ('generating', 'ready', 'failed', 'published')
  )
);

CREATE INDEX idx_gen_course_blueprint ON generated_courses(blueprint_id);
CREATE INDEX idx_gen_course_status    ON generated_courses(status);
CREATE INDEX idx_gen_course_id        ON generated_courses(course_id) WHERE course_id IS NOT NULL;

-- ============================================================
-- KNOWLEDGE GRAPH NODES
-- ============================================================
CREATE TABLE knowledge_nodes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_code     VARCHAR(80) NOT NULL UNIQUE, -- "KN-TOAN-G05-FRACTION-001"
  concept_vi    VARCHAR(200) NOT NULL,
  concept_en    VARCHAR(200),
  subject       VARCHAR(20) NOT NULL,
  grade_level   SMALLINT NOT NULL CHECK (grade_level BETWEEN 1 AND 12),
  importance    VARCHAR(20) NOT NULL DEFAULT 'SUPPORTING',
    -- CORE | SUPPORTING | ENRICHMENT
  bloom_level   VARCHAR(20) NOT NULL,
  embedding     VECTOR(1536),  -- pgvector for semantic search (optional)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kn_subject     ON knowledge_nodes(subject);
CREATE INDEX idx_kn_grade       ON knowledge_nodes(grade_level);
CREATE INDEX idx_kn_importance  ON knowledge_nodes(importance);

-- ============================================================
-- KNOWLEDGE GRAPH EDGES
-- ============================================================
CREATE TABLE knowledge_edges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id         UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  to_id           UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relationship_type VARCHAR(30) NOT NULL,
    -- PREREQUISITE | GENERALIZES | APPLIES_TO | CONTRASTS_WITH | PART_OF
  weight          DECIMAL(4,2) NOT NULL DEFAULT 1.0 CHECK (weight BETWEEN 0 AND 1),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT edge_no_self_loop CHECK (from_id != to_id),
  UNIQUE(from_id, to_id, relationship_type)
);

CREATE INDEX idx_ke_from ON knowledge_edges(from_id);
CREATE INDEX idx_ke_to   ON knowledge_edges(to_id);
CREATE INDEX idx_ke_type ON knowledge_edges(relationship_type);

-- ============================================================
-- QA REPORTS (per generated blueprint)
-- ============================================================
CREATE TABLE qa_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id    UUID NOT NULL REFERENCES curriculum_blueprints(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending | passed | failed | warnings
  checklist_json  JSONB NOT NULL DEFAULT '{}',
  issues          JSONB NOT NULL DEFAULT '[]',
  warnings        JSONB NOT NULL DEFAULT '[]',
  run_at          TIMESTAMPTZ DEFAULT NOW(),
  duration_ms     INTEGER
);

CREATE INDEX idx_qa_blueprint ON qa_reports(blueprint_id);
CREATE INDEX idx_qa_status    ON qa_reports(status);

-- ============================================================
-- AI PROMPT TEMPLATES
-- ============================================================
CREATE TABLE ai_prompt_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key  VARCHAR(50) NOT NULL UNIQUE, -- "topic_naming", "objective_writing"
  version       INTEGER NOT NULL DEFAULT 1,
  model_target  VARCHAR(50) NOT NULL,        -- "gpt-4o-mini", "claude-sonnet"
  system_prompt TEXT NOT NULL,
  user_template TEXT NOT NULL,               -- Handlebars/Mustache template
  output_schema JSONB,                       -- JSON Schema for structured output
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Workflow Design

### 6.1 Main Generation Workflow

```
START
│
▼
[1] VALIDATE INPUT PARAMETERS
│   ├── Schema validation (Zod/Joi)
│   ├── Business rule validation
│   │   ├── ageRange must match grade
│   │   ├── topicCount × lessonsPerTopic × avgLessonHours ≤ totalHours
│   │   └── learningOutcome ≥ 3 items
│   ├── Auto-correct where safe (e.g. derive hoursPerWeek from grade)
│   └── [FAIL] → Return ValidationError with field-level errors
│
▼
[2] CHECK CACHE
│   ├── Compute SHA-256(input_params)
│   ├── Query curriculum_blueprints WHERE params_hash = hash AND status = 'published'
│   └── [HIT] → Return cached blueprint immediately (skip generation)
│
▼
[3] LOAD SUBJECT KNOWLEDGE GRAPH
│   ├── SELECT * FROM knowledge_nodes WHERE subject = ? AND grade_level = ?
│   ├── SELECT * FROM knowledge_edges WHERE from_id IN (loaded nodes)
│   ├── Load topic_library WHERE subject = ? AND grade_level = ?
│   └── If CUSTOM curriculum → merge customKnowledgeBase
│
▼
[4] BUILD PREREQUISITE GRAPH
│   ├── buildPrerequisiteGraph(topics, knowledgeGraph)
│   ├── detectCycles() → break weakest edge if found
│   └── computeTopologicalOrder()
│
▼
[5] GENERATE TOPIC SEQUENCE
│   ├── generateRoadmap(input) → LearningRoadmap
│   ├── Apply topological order from prerequisite graph
│   ├── Map topics to phases
│   └── Validate: topicCount matches requested count ± 10%
│
▼
[6] APPLY DIFFICULTY CURVE
│   ├── generateDifficultyCurve(input) → DifficultyCurveData
│   ├── Assign difficulty score to each topic
│   └── Validate: no consecutive jump > 2.0
│
▼
[7] GENERATE LESSON SEQUENCES
│   ├── FOR EACH topic: sequenceLessons(topic, deliveryMode)
│   ├── Inject interleaved review lessons
│   └── Validate: total hours ≤ durationWeeks × hoursPerWeek
│
▼
[8] PARALLEL PLAN GENERATION (all run concurrently)
│   ├── [8a] generateAssessmentPlan()
│   ├── [8b] generateHomeworkPlan()        (if features.homework)
│   ├── [8c] generateReviewSchedule()
│   ├── [8d] generateGamificationPlan()    (if features.gamification)
│   ├── [8e] generateAITutorPlan()         (if features.aiTutor)
│   └── [8f] generateVideoPlan()           (if features.video)
│
▼
[9] AI ENRICHMENT (conditional)
│   ├── aiGenerateTopicNames()             (if topic names are generic)
│   ├── aiWriteSmartObjectives()           (refine objectives)
│   ├── aiInferMissingPrerequisites()      (if confidence < threshold)
│   └── aiGenerateSocraticPrompts()        (if aiTutor enabled)
│
▼
[10] ASSEMBLE BLUEPRINT
│   ├── Merge all plan outputs
│   ├── Compute aggregate metadata
│   └── Assign blueprint ID + version
│
▼
[11] QA VALIDATION
│   ├── Run all QA checklist items (see Section 9)
│   ├── [FAIL] → Log issues; attempt auto-fix; retry once
│   ├── [WARN] → Log warnings; continue
│   └── Generate QA report
│
▼
[12] CACHE + PERSIST
│   ├── INSERT INTO curriculum_blueprints
│   ├── INSERT INTO qa_reports
│   └── Set status = 'draft'
│
▼
[13] EXPORT
│   ├── Serialize to requested format(s)
│   └── Return CurriculumBlueprint + export URLs
│
END
```

### 6.2 Error Handling

```typescript
// ============================================================
// ERROR TYPES
// ============================================================

class ValidationError extends Error {
  fields: { field: string; message: string; value: unknown }[];
  code = "VALIDATION_ERROR";
}

class PrerequisiteGraphError extends Error {
  cycles: string[][];
  code = "CIRCULAR_PREREQUISITE";
}

class InsufficientTopicsError extends Error {
  requiredHours: number;
  availableHours: number;
  code = "INSUFFICIENT_TOPICS";
  // Auto-fix: reduce lessonsPerTopic or topicCount
}

class AIServiceError extends Error {
  step: string;
  modelUsed: string;
  code = "AI_SERVICE_ERROR";
  // Fallback: use template defaults without AI enrichment
}

// ============================================================
// FALLBACK BEHAVIORS
// ============================================================
const FALLBACK_BEHAVIORS = {
  AI_SERVICE_UNAVAILABLE: {
    action: "USE_TEMPLATES",
    description: "Use pre-defined topic names and objectives from topic_library"
  },
  CIRCULAR_PREREQUISITE: {
    action: "BREAK_WEAKEST_EDGE",
    description: "Remove OPTIONAL edge first, then RECOMMENDED, log warning"
  },
  INSUFFICIENT_HOURS: {
    action: "AUTO_ADJUST",
    steps: [
      "Reduce lessonsPerTopic by 1 (minimum 2)",
      "If still insufficient, reduce topicCount by 10%",
      "Warn: course may not cover all specified outcomes"
    ]
  },
  KNOWLEDGE_GRAPH_EMPTY: {
    action: "USE_GENERIC_GRAPH",
    description: "Load generic subject graph for the grade, flag for manual review"
  },
  QA_INVARIANT_FAILED: {
    action: "AUTO_FIX_THEN_RETRY",
    maxRetries: 2,
    description: "Attempt automated correction; if fails after 2 retries, mark blueprint as 'needs_review'"
  }
};
```

---

## 7. AI Model Integration Points

### 7.1 Integration Table

| Step | AI Task | Model | Justification | Prompt Template |
|------|---------|-------|---------------|-----------------|
| Topic naming | Generate compelling topic names from knowledge cluster keywords | `gpt-4o-mini` | Cheap, creative, fast; doesn't need deep reasoning | `template_topic_naming` |
| Objective writing | Convert vague goals to SMART objectives with Bloom verbs | `claude-sonnet-4` | Precise instruction-following; strong at educational writing | `template_smart_objectives` |
| Prerequisite inference | Infer implicit dependencies from topic descriptions | `gpt-4o` | Requires multi-hop reasoning across knowledge domains | `template_prereq_inference` |
| Difficulty calibration | Adjust generated difficulty scores to learner profile descriptors | `claude-sonnet-4` | Nuanced judgment; must balance rigor vs. accessibility | `template_difficulty_calibration` |
| AI Tutor prompts | Generate Socratic question sequences + misconception responses | `claude-opus-4` | Highest reasoning quality needed for pedagogical depth | `template_socratic_tutor` |
| Video script outlines | Generate structured narration outlines for lesson videos | `gpt-4o` | Good at structured creative output | `template_video_script` |
| Worksheet sections | Generate question section headers + bloom-tagged items | `gpt-4o-mini` | High volume, low stakes; cost efficiency | `template_worksheet_gen` |

### 7.2 Prompt Templates

```typescript
// ============================================================
// TEMPLATE 01: Topic Naming
// ============================================================
const TEMPLATE_TOPIC_NAMING = {
  system: `You are an expert curriculum designer for Vietnamese K-12 students.
Generate engaging, age-appropriate topic names that are:
- Clear and descriptive (students know what they'll learn)
- Culturally relevant to Vietnamese context
- Maximum 8 words in Vietnamese
- Include English equivalent`,

  user: `Subject: {{subject}}
Grade: {{grade}}
Knowledge cluster keywords: {{keywords}}
Curriculum standard: {{curriculum}}
Difficulty level: {{difficulty}}/10

Generate a topic name in Vietnamese with English equivalent.
Output JSON: { "nameVi": string, "nameEn": string, "tagline": string }`
};

// ============================================================
// TEMPLATE 02: SMART Objectives
// ============================================================
const TEMPLATE_SMART_OBJECTIVES = {
  system: `You are an instructional designer trained in Bloom's Taxonomy and SMART objective writing.
Each objective must follow the formula:
"[Action verb at Bloom level] + [specific content] + [condition/context] + [measurable standard]"

Use Vietnamese for objectives targeting Vietnamese learners.`,

  user: `Topic: {{topicName}}
Subject: {{subject}}, Grade: {{grade}}
Target Bloom levels: {{bloomLevels}}
Duration: {{durationHours}} hours
General goals: {{generalGoals}}

Write {{count}} SMART learning objectives.
Output JSON array of strings.`
};

// ============================================================
// TEMPLATE 03: Prerequisite Inference
// ============================================================
const TEMPLATE_PREREQ_INFERENCE = {
  system: `You are a curriculum knowledge graph expert.
Analyze topic descriptions and identify prerequisite relationships.
Consider: conceptual dependencies, skill prerequisites, vocabulary requirements.
Be conservative: only flag REQUIRED prerequisites for concepts that cannot be understood without prior knowledge.`,

  user: `Topics list (with descriptions):
{{topicsJson}}

Existing prerequisite edges:
{{existingEdges}}

Identify missing prerequisite relationships.
For each inferred prerequisite, provide:
- from: topicId (prerequisite)
- to: topicId (dependent)  
- strength: REQUIRED | RECOMMENDED | OPTIONAL
- confidence: 0.0-1.0
- reason: short explanation

Output JSON array.`
};

// ============================================================
// TEMPLATE 04: Difficulty Calibration
// ============================================================
const TEMPLATE_DIFFICULTY_CALIBRATION = {
  system: `You are an expert in educational assessment and difficulty calibration.
Review the generated difficulty curve and provide adjustments based on:
- Learner profile context
- Subject-specific cognitive load
- Age-appropriate challenge levels`,

  user: `Profile: {{difficultyProfile}}
Grade: {{grade}}, Subject: {{subject}}
Generated difficulty values: {{difficultyArray}}
Topic names: {{topicNames}}

Review and flag any topics where the difficulty score seems miscalibrated.
Provide adjusted values with reasoning.
Output JSON: { adjustments: [{ topicIndex: number, currentValue: number, suggestedValue: number, reason: string }] }`
};

// ============================================================
// TEMPLATE 05: Socratic Tutor Prompts
// ============================================================
const TEMPLATE_SOCRATIC_TUTOR = {
  system: `You are Ava, an AI tutor specializing in Socratic teaching methods for K-12 students.
Your approach:
- Never give direct answers; guide students to discover answers themselves
- Use age-appropriate language (grade {{grade}})
- Identify common misconceptions and address them with counter-examples
- Provide graduated hints: conceptual → procedural → numerical
- Always end responses with an open question to maintain dialogue`,

  user: `Topic: {{topicName}}, Grade: {{grade}}, Subject: {{subject}}
Learning objective: {{objective}}
Common misconceptions in this topic: {{misconceptions}}
Difficulty level: {{difficulty}}/10

Generate:
1. 3 opening Socratic prompts to assess prior knowledge
2. 5 guiding prompts for the main concept (conceptual understanding)
3. 5 guiding prompts for practice (procedural application)
4. 3 prompts for each common misconception
5. 2 closing reflection prompts (metacognitive)

Output structured JSON.`
};
```

### 7.3 AI Service Architecture

```typescript
// AI Service: routing, retry, cost management
class AIService {
  async call(templateKey: string, variables: Record<string, unknown>): Promise<AIResult> {
    const template = await this.loadTemplate(templateKey);
    const model = this.resolveModel(template.model_target);
    
    // Cost guard: estimate tokens before call
    const estimatedTokens = this.estimateTokens(template, variables);
    if (estimatedTokens > COST_THRESHOLD_TOKENS) {
      throw new CostGuardError(`Estimated ${estimatedTokens} tokens exceeds threshold`);
    }

    let lastError: Error;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await model.complete({
          system: this.render(template.system_prompt, variables),
          user: this.render(template.user_template, variables),
          outputSchema: template.output_schema,
          temperature: 0.3  // low temp for structured educational output
        });
        
        await this.logUsage(templateKey, model.name, response.usage);
        return response;
        
      } catch (error) {
        lastError = error;
        if (error.code === 'RATE_LIMIT') {
          await sleep(2 ** attempt * 1000);  // exponential backoff
        } else if (error.code === 'MODEL_UNAVAILABLE') {
          model = this.fallbackModel(model.name);  // e.g. claude → gpt-4o
        } else {
          throw error;  // non-retryable
        }
      }
    }
    throw lastError;
  }
}
```

---

## 8. Output Formats

### 8.1 JSON (Full Blueprint)

```typescript
// Full blueprint serialized as JSON
// Used for: API responses, internal storage, programmatic access
const exportJSON = (blueprint: CurriculumBlueprint): string =>
  JSON.stringify(blueprint, null, 2);

// Endpoint: GET /api/generator/blueprints/:id?format=json
// Content-Type: application/json
// File: curriculum-{id}-v{version}.json
```

### 8.2 Markdown (Human Readable)

```markdown
<!-- Template for Markdown export -->

# {{courseName}} — Curriculum Blueprint

**Subject:** {{subject}} | **Grade:** {{grade}} | **Duration:** {{durationWeeks}} weeks
**Standard:** {{curriculum}} | **Profile:** {{difficultyProfile}}

---

## Learning Roadmap

**Path Type:** {{pathType}}
**Entry Requirements:** {{entryRequirements}}
**Exit Competencies:** {{exitCompetencies}}

### Phases
{{#each phases}}
#### Phase {{phaseId}}: {{phaseName}} ({{durationWeeks}} weeks)
*Theme: {{theme}}*
Topics: {{topicIds}}
{{/each}}

---

## Topic Structure

{{#each topics}}
### {{topicId}} — {{topicName}} (Difficulty: {{difficulty}}/10)

**Objectives:**
{{#each objectives}}
- {{this}}
{{/each}}

**Duration:** {{durationHours}} hours | **Weeks:** {{startWeek}}–{{endWeek}}
**Prerequisites:** {{prerequisites}}

#### Lessons ({{lessons.length}})
{{#each lessons}}
| {{lessonId}} | {{lessonName}} | {{type}} | {{durationMins}} min |
{{/each}}

---
{{/each}}

## Assessment Calendar

| Week | Assessment | Type | Topics Covered |
|------|-----------|------|----------------|
{{#each assessmentCalendar}}
| {{week}} | {{description}} | {{type}} | {{topicId}} |
{{/each}}

## Certificate Requirements
- Min Attendance: {{minAttendance}}%
- Min Final Score: {{minFinalScore}}/100
- Competencies: {{competenciesGranted}}
```

### 8.3 CSV (Spreadsheet Import)

```
# Three separate CSV files per blueprint:

## 1. topics.csv
topicId,topicName,phase,sequenceIndex,startWeek,endWeek,durationHours,difficulty,bloomTarget,prerequisites

## 2. lessons.csv  
lessonId,topicId,lessonName,sequenceIndex,type,durationMins,objectives

## 3. assessment_calendar.csv
week,assessmentId,type,topicId,durationMins,questionCount,bloomLevels,weight
```

### 8.4 SCORM Package Metadata

```xml
<!-- imsmanifest.xml template -->
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{{blueprintId}}" version="1.2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    <lom:lom>
      <lom:general>
        <lom:title><lom:string language="vi">{{courseName}}</lom:string></lom:title>
        <lom:description><lom:string language="vi">{{courseDescription}}</lom:string></lom:description>
      </lom:general>
      <lom:educational>
        <lom:typicalAgeRange><lom:string>{{ageRange.min}}-{{ageRange.max}}</lom:string></lom:typicalAgeRange>
        <lom:difficulty>{{scormDifficulty}}</lom:difficulty>
        <lom:typicalLearningTime>PT{{totalHours}}H</lom:typicalLearningTime>
      </lom:educational>
    </lom:lom>
  </metadata>
  <organizations default="ORG-{{blueprintId}}">
    <organization identifier="ORG-{{blueprintId}}">
      <title>{{courseName}}</title>
      {{#each topics}}
      <item identifier="ITEM-{{topicId}}">
        <title>{{topicName}}</title>
        {{#each lessons}}
        <item identifier="ITEM-{{lessonId}}" identifierref="RES-{{lessonId}}">
          <title>{{lessonName}}</title>
          <adlcp:masteryscore>70</adlcp:masteryscore>
        </item>
        {{/each}}
      </item>
      {{/each}}
    </organization>
  </organizations>
</manifest>
```

### 8.5 AvaB Database Seed Script (Prisma)

```typescript
// Generated seed script for avab.vn
// Imports blueprint into live database

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedCurriculum(blueprint: CurriculumBlueprint) {
  await prisma.$transaction(async (tx) => {
    
    // 1. Create Course
    const course = await tx.course.create({ data: {
      id:           blueprint.id,
      name:         blueprint.metadata.courseName,
      subject:      blueprint.metadata.subject,
      grade:        blueprint.metadata.grade,
      durationWeeks: blueprint.metadata.durationWeeks,
      difficultyProfile: blueprint.metadata.difficultyProfile,
      curriculum:   blueprint.metadata.curriculum,
      status:       'DRAFT',
      blueprintId:  blueprint.id,
    }});

    // 2. Create Topics
    for (const topic of blueprint.topicStructure) {
      const dbTopic = await tx.topic.create({ data: {
        id:           topic.topicId,
        courseId:     course.id,
        name:         topic.topicName,
        sequenceIndex: topic.sequenceIndex,
        durationHours: topic.durationHours,
        difficulty:   topic.difficulty,
        bloomTarget:  topic.bloomTarget,
        objectives:   topic.objectives,
        startWeek:    topic.startWeek,
        endWeek:      topic.endWeek,
      }});

      // 3. Create Lessons per Topic
      for (const lesson of topic.lessons) {
        await tx.lesson.create({ data: {
          id:           lesson.lessonId,
          topicId:      dbTopic.id,
          name:         lesson.lessonName,
          type:         lesson.type,
          sequenceIndex: lesson.sequenceIndex,
          durationMins: lesson.durationMins,
          objectives:   lesson.objectives,
        }});
      }

      // 4. Create Prerequisite edges
      for (const prereqId of topic.prerequisites) {
        await tx.topicPrerequisite.upsert({
          where: { topicId_prerequisiteId: { topicId: topic.topicId, prerequisiteId: prereqId }},
          create: { topicId: topic.topicId, prerequisiteId: prereqId, strength: 'REQUIRED' },
          update: {}
        });
      }
    }

    // 5. Create Assessment Plan
    await tx.assessmentPlan.create({ data: {
      courseId:    course.id,
      planJson:    blueprint.assessmentPlan as any,
    }});

    // 6. Create Gamification Plan (if enabled)
    if (blueprint.gamificationPlan) {
      await tx.gamificationPlan.create({ data: {
        courseId: course.id,
        planJson: blueprint.gamificationPlan as any,
      }});
    }

    console.log(`✅ Seeded course: ${course.name} (${blueprint.topicStructure.length} topics)`);
  });
}
```

---

## 9. QA Checklist — Generator

### 9.1 Automated Checks (run before every blueprint is cached)

```typescript
interface QACheckResult {
  passed:   boolean;
  message:  string;
  severity: "ERROR" | "WARNING" | "INFO";
  autoFixed?: boolean;
}

const QA_CHECKS: QACheck[] = [

  // ── Structure Checks ─────────────────────────────────────
  {
    id: "QA-001",
    name: "All topics have prerequisites mapped (except first-layer topics)",
    check: (blueprint) => {
      const firstLayer = blueprint.prerequisiteGraph.levels[0].topicIds;
      const nonFirstLayer = topics.filter(t => !firstLayer.includes(t.topicId));
      const missing = nonFirstLayer.filter(t => t.prerequisites.length === 0);
      return { passed: missing.length === 0,
               message: missing.length > 0 ? `Topics missing prerequisites: ${missing.map(t => t.topicId)}` : "OK" };
    }
  },

  // ── Difficulty Curve Checks ───────────────────────────────
  {
    id: "QA-002",
    name: "No consecutive difficulty jump > 2.0 levels",
    check: (blueprint) => {
      const values = blueprint.difficultyCurve.values;
      const violations = [];
      for (let i = 1; i < values.length; i++) {
        if (values[i] - values[i-1] > 2.0) violations.push({ i, delta: values[i] - values[i-1] });
      }
      return { passed: violations.length === 0,
               message: violations.length > 0 ? `Jumps at indices: ${JSON.stringify(violations)}` : "OK" };
    }
  },

  // ── Time Checks ───────────────────────────────────────────
  {
    id: "QA-003",
    name: "Total lesson hours ≤ available course hours",
    check: (blueprint) => {
      const totalLessonHours = blueprint.topicStructure
        .flatMap(t => t.lessons)
        .reduce((sum, l) => sum + l.durationMins / 60, 0);
      const available = blueprint.metadata.durationWeeks * blueprint.metadata.hoursPerWeek;
      return { passed: totalLessonHours <= available * 1.05,  // 5% tolerance
               message: `Total: ${totalLessonHours.toFixed(1)}h / Available: ${available}h` };
    }
  },

  // ── Objectives Checks ─────────────────────────────────────
  {
    id: "QA-004",
    name: "All SMART objectives contain measurable action verbs",
    check: (blueprint) => {
      const BLOOM_VERBS = ["xác định", "nhớ", "giải thích", "phân tích", "áp dụng",
                           "tạo ra", "đánh giá", "identify", "recall", "explain",
                           "analyze", "apply", "create", "evaluate", "demonstrate"];
      const allObjectives = blueprint.topicStructure.flatMap(t => t.objectives);
      const weak = allObjectives.filter(obj =>
        !BLOOM_VERBS.some(v => obj.toLowerCase().includes(v))
      );
      return { passed: weak.length === 0,
               message: weak.length > 0 ? `${weak.length} objectives may lack action verbs` : "OK",
               severity: weak.length > 0 ? "WARNING" : "INFO" };
    }
  },

  // ── Assessment Checks ─────────────────────────────────────
  {
    id: "QA-005",
    name: "Assessment covers all 6 Bloom levels across course",
    check: (blueprint) => {
      const allLevels = new Set<string>();
      const allItems = [
        ...blueprint.assessmentPlan.formativeItems,
        ...blueprint.assessmentPlan.summativeItems,
        blueprint.assessmentPlan.finalAssessment
      ];
      allItems.forEach(item => item.bloomLevels?.forEach(l => allLevels.add(l)));
      const missing = ALL_BLOOM_LEVELS.filter(l => !allLevels.has(l));
      return { passed: missing.length === 0,
               message: missing.length > 0 ? `Missing Bloom levels: ${missing}` : "All 6 covered" };
    }
  },

  // ── Homework Checks ───────────────────────────────────────
  {
    id: "QA-006",
    name: "Homework review ratio between 60-80%",
    check: (blueprint) => {
      if (!blueprint.homeworkPlan) return { passed: true, message: "Homework not enabled" };
      const ratio = blueprint.homeworkPlan.reviewRatio;
      return { passed: ratio >= 0.60 && ratio <= 0.80,
               message: `Review ratio: ${(ratio * 100).toFixed(0)}% (target: 60-80%)` };
    }
  },

  // ── Review Schedule Checks ────────────────────────────────
  {
    id: "QA-007",
    name: "All topics reviewed within 30 days of introduction",
    check: (blueprint) => {
      const violations = blueprint.reviewSchedule.topicReviews.filter(tr => {
        const maxReviewDay = Math.max(...tr.reviewSessions.map(s => s.scheduledDay));
        const firstDay = tr.firstTaught * 7;
        return maxReviewDay - firstDay > 30;
      });
      return { passed: violations.length === 0,
               message: violations.length > 0 ? `${violations.length} topics not reviewed within 30 days` : "OK" };
    }
  },

  // ── Graph Checks ──────────────────────────────────────────
  {
    id: "QA-008",
    name: "No circular prerequisites in final graph",
    check: (blueprint) => {
      const cycles = blueprint.prerequisiteGraph.circularDependencies;
      return { passed: cycles.length === 0,
               message: cycles.length > 0 ? `Remaining cycles: ${JSON.stringify(cycles)}` : "Clean DAG" };
    }
  },

  // ── Certificate Checks ────────────────────────────────────
  {
    id: "QA-009",
    name: "Certificate requirements are achievable",
    check: (blueprint) => {
      const req = blueprint.certificateRequirements.requirements;
      // Passing score must be ≤ 85 (too high = not achievable for most)
      // Min attendance must be ≤ 90%
      const issues = [];
      if (req.minFinalScore > 85) issues.push("Final score requirement too high (>85)");
      if (req.minAttendance > 0.90) issues.push("Attendance requirement too strict (>90%)");
      return { passed: issues.length === 0, message: issues.join("; ") || "OK" };
    }
  },

  // ── Content Density Checks ────────────────────────────────
  {
    id: "QA-010",
    name: "No lesson introduces more than 3 new concepts",
    check: (blueprint) => {
      const overloaded = blueprint.topicStructure
        .flatMap(t => t.lessons)
        .filter(l => l.type === "CORE_CONTENT")
        .filter(l => {
          // Estimate new concepts from activity count and lesson objectives
          return l.objectives.length > 3;
        });
      return { passed: overloaded.length === 0,
               message: overloaded.length > 0 ? `${overloaded.length} lessons may cause cognitive overload` : "OK",
               severity: "WARNING" };
    }
  },

  // ── Gamification Checks ───────────────────────────────────
  {
    id: "QA-011",
    name: "XP system is balanced (not over- or under-rewarding)",
    check: (blueprint) => {
      if (!blueprint.gamificationPlan) return { passed: true, message: "Not enabled" };
      const xp = blueprint.gamificationPlan.xpSystem;
      const totalEarnableXP = blueprint.metadata.totalLessons * xp.lessonComplete
                            + blueprint.metadata.durationWeeks * 6 * xp.streakBonus;
      const maxLevel = blueprint.gamificationPlan.levels.at(-1)?.maxXP ?? 0;
      return {
        passed: totalEarnableXP >= maxLevel * 0.8,  // learner can reach max level
        message: `Total earnable XP: ${totalEarnableXP}, Max level XP: ${maxLevel}`
      };
    }
  }
];
```

### 9.2 QA Execution

```typescript
async function runQA(blueprint: CurriculumBlueprint): Promise<QAReport> {
  const results = await Promise.all(QA_CHECKS.map(check => {
    try { return { checkId: check.id, name: check.name, ...check.check(blueprint) }; }
    catch (e) { return { checkId: check.id, name: check.name, passed: false, message: e.message, severity: "ERROR" }; }
  }));

  const errors   = results.filter(r => !r.passed && r.severity === "ERROR");
  const warnings = results.filter(r => !r.passed && r.severity !== "ERROR");
  const passed   = results.filter(r => r.passed);

  const status = errors.length > 0 ? "failed"
               : warnings.length > 0 ? "warnings"
               : "passed";

  return { blueprintId: blueprint.id, status, checklistJson: results, issues: errors, warnings };
}
```

---

## 10. Best Practices & Anti-Patterns

### 10.1 Best Practices

```
╔══════════════════════════════════════════════════════════════════╗
║              CURRICULUM GENERATOR BEST PRACTICES                  ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ✅ ALWAYS start with Backward Design (UbD)                      ║
║     → Define outcomes FIRST, then design evidence, then lessons   ║
║                                                                   ║
║  ✅ Build prerequisite graph BEFORE sequencing topics            ║
║     → Topological order ensures valid learning sequence           ║
║                                                                   ║
║  ✅ Use Spaced Repetition for review scheduling                  ║
║     → Ebbinghaus intervals: 1, 3, 7, 14, 30 days                ║
║                                                                   ║
║  ✅ Apply Spiral Curriculum (Bruner)                             ║
║     → Revisit core concepts at increasing complexity              ║
║                                                                   ║
║  ✅ Mix difficulty within each session                           ║
║     → Easy (warm-up) → Medium (core) → Hard (challenge)          ║
║                                                                   ║
║  ✅ Include metacognitive checkpoints                            ║
║     → "What did I learn? What's still unclear? How can I use it?" ║
║                                                                   ║
║  ✅ Distribute Bloom levels deliberately per phase               ║
║     → Early: Remember/Understand → Middle: Apply/Analyze          ║
║     → Late: Evaluate/Create                                       ║
║                                                                   ║
║  ✅ Balance formative/summative: 70% / 30%                       ║
║     → Assessment for learning vs. assessment of learning          ║
║                                                                   ║
║  ✅ Homework review ratio: 60-80% review, 20-40% new content     ║
║     → Prevents forgetting; reduces cognitive overload             ║
║                                                                   ║
║  ✅ Cache blueprints by params_hash                              ║
║     → Identical inputs must not regenerate (cost + consistency)  ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

### 10.2 Anti-Patterns

```
╔══════════════════════════════════════════════════════════════════╗
║                  ANTI-PATTERNS — NEVER DO THESE                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  ❌ LINEAR DIFFICULTY ONLY (no review cycles)                    ║
║     → Students forget early content; no spiral reinforcement      ║
║     → FIX: Interleave review lessons every 3-5 lessons           ║
║                                                                   ║
║  ❌ TOO MANY NEW CONCEPTS PER LESSON (cognitive overload)        ║
║     → Working memory capacity: ~7±2 chunks (Miller's Law)         ║
║     → FIX: Max 3 new concepts per lesson; segment complex topics  ║
║                                                                   ║
║  ❌ SUMMATIVE-ONLY ASSESSMENT                                    ║
║     → No feedback loop during learning; high-stakes only          ║
║     → FIX: Exit tickets per lesson; quizzes per topic             ║
║                                                                   ║
║  ❌ IGNORING PREREQUISITE GAPS                                   ║
║     → Teaching fractions without whole number mastery             ║
║     → FIX: Always map prerequisites; warn when gaps are detected  ║
║                                                                   ║
║  ❌ NO SPIRAL CURRICULUM ELEMENTS                                ║
║     → "Done with fractions forever in week 3"                     ║
║     → FIX: Return to core concepts at higher Bloom levels later   ║
║                                                                   ║
║  ❌ UNIFORM DIFFICULTY ACROSS ALL SESSIONS                       ║
║     → No engagement arc; boredom or frustration                   ║
║     → FIX: S-curve distribution; vary within-session difficulty   ║
║                                                                   ║
║  ❌ FORGETTING CURVE IGNORED IN HOMEWORK DESIGN                  ║
║     → All homework on new content only                            ║
║     → FIX: 60-80% spaced review, 20-40% new content              ║
║                                                                   ║
║  ❌ SCATTERSHOT BLOOM COVERAGE                                   ║
║     → All assessment at REMEMBER level; no EVALUATE/CREATE        ║
║     → FIX: Intentional Bloom distribution per phase               ║
║                                                                   ║
║  ❌ CIRCULAR PREREQUISITES                                       ║
║     → Topic A requires B requires A                               ║
║     → FIX: Cycle detection + weakest-edge removal                 ║
║                                                                   ║
║  ❌ CERTIFICATE REQUIREMENTS TOO STRICT                          ║
║     → 95% attendance, 90% final score                             ║
║     → FIX: Align to realistic learner profiles; max 85% score    ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 11. Integration với AvaB Platform

### 11.1 Architecture Integration Map

```
AvaB Platform
├── avab.vn (Next.js + Prisma)
│   ├── /admin/courses/create          ← Admin UI triggers Generator
│   ├── /api/generator/create          ← POST endpoint → generator-core service
│   ├── /api/generator/blueprints/:id  ← GET blueprint status/output
│   └── /api/generator/export/:id      ← GET specific format export
│
├── generator-core (BullMQ workers)
│   ├── Queue: curriculum-generation   ← jobs from /api/generator/create
│   ├── Queue: ai-enrichment           ← AI sub-tasks
│   └── Queue: export-jobs             ← format conversion jobs
│
├── PostgreSQL (shared DB)
│   ├── curriculum_blueprints          ← Generator writes
│   ├── topic_library                  ← Generator reads + writes
│   ├── knowledge_nodes/edges          ← Generator reads
│   └── courses/topics/lessons         ← Seed script writes (avab.vn Prisma schema)
│
├── Redis (shared cache)
│   ├── blueprint:{hash}               ← Blueprint cache (TTL: 30 days)
│   └── generation:status:{jobId}      ← Job progress (TTL: 24h)
│
└── AI Routes (/api/ai/*)
    ├── /api/ai/generate-text          ← Used by AI service
    └── /api/ai/structured-output      ← Used for JSON schema outputs
```

### 11.2 Prisma Models (avab.vn)

```prisma
// Addition to existing Prisma schema

model CurriculumBlueprint {
  id              String   @id @default(uuid())
  paramsHash      String   @unique
  inputParams     Json
  blueprintJson   Json
  version         String   @default("1.0.0")
  status          String   @default("draft")
  generatedBy     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  expiresAt       DateTime?
  
  generatedCourses GeneratedCourse[]
  qaReports        QAReport[]
  
  @@index([status])
  @@map("curriculum_blueprints")
}

model GeneratedCourse {
  id           String   @id @default(uuid())
  blueprintId  String
  courseId     String?
  name         String
  status       String   @default("generating")
  errorLog     Json     @default("[]")
  generatedAt  DateTime @default(now())
  publishedAt  DateTime?
  
  blueprint CurriculumBlueprint @relation(fields: [blueprintId], references: [id])
  course    Course?              @relation(fields: [courseId], references: [id])
  
  @@map("generated_courses")
}

// Extension to existing Course model
model Course {
  // ... existing fields ...
  blueprintId      String?
  difficultyProfile String?
  curriculum       String?
  
  blueprint        CurriculumBlueprint? @relation(fields: [blueprintId], references: [id])
  generatedFrom    GeneratedCourse[]
}
```

### 11.3 A2PLM Integration

```typescript
// A2PLM model: Z_t^i personalization
// Generator provides the baseline curriculum scaffold.
// A2PLM adjusts in real-time based on learner state.

interface A2PLMCurriculumHook {
  blueprintId:    string;
  topicId:        string;
  learnerId:      string;
  
  // Generator provides static difficulty score
  baseDifficulty: number;        // from DifficultyCurveData
  
  // A2PLM adjusts dynamically
  personalizedDifficulty: number; // Z_t^i output
  
  // A2PLM may skip/repeat topics
  recommendedAction:
    | "CONTINUE"      // proceed as planned
    | "SLOW_DOWN"     // revisit current topic
    | "SKIP_AHEAD"    // learner exceeded expectations
    | "REVIEW_PREREQ" // prerequisite mastery gap detected
    | "ENRICHMENT";   // add enrichment content
}

// Generator provides:
// - prerequisiteGraph → A2PLM uses to detect gaps
// - difficultyCurve   → A2PLM uses as baseline
// - assessmentPlan    → A2PLM updates based on formative results
// - aiTutorPlan       → A2PLM triggers appropriate Socratic prompts
```

### 11.4 Admin Course Creator UI Integration

```typescript
// Admin UI calls POST /api/generator/create with GeneratorInput
// Response is a job ticket; UI polls /api/generator/status/:jobId

// Job states:
type GenerationJobStatus =
  | "QUEUED"          // waiting in BullMQ
  | "VALIDATING"      // step 1
  | "BUILDING_GRAPH"  // step 2-4
  | "SEQUENCING"      // step 5-7
  | "GENERATING_PLANS"// step 8 (parallel)
  | "AI_ENRICHING"    // step 9
  | "ASSEMBLING"      // step 10
  | "QA_CHECKING"     // step 11
  | "DONE"            // ready
  | "FAILED";         // with error

// SSE endpoint for real-time progress:
// GET /api/generator/progress/:jobId  (text/event-stream)
// Events: { step: string, progress: number, message: string }
```

### 11.5 LMS Delivery Integration

```typescript
// After blueprint is seeded into avab.vn database:
// LMS reads Course → Topics → Lessons in topological order
// A2PLM personalizes the delivery path per learner
// AI Tutor is activated for struggling learners (formative score < 60%)
// Review lessons are triggered by review schedule
// Gamification events fire on lesson completion, badge earn, etc.

// Key LMS ↔ Generator contract:
// - LMS never modifies blueprint; it reads and delivers
// - A2PLM is the only component that can alter the delivery order
// - All content (scripts, worksheets, AI prompts) references back to blueprint
```

---

## Appendix A: Parameter Validation Rules

```typescript
const VALIDATION_RULES = {
  courseName:       { minLen: 3, maxLen: 120 },
  grade:            { min: 1, max: 12 },
  "ageRange.min":   { min: 5, max: 17 },
  "ageRange.max":   { min: 6, max: 18, greaterThan: "ageRange.min" },
  durationWeeks:    { min: 4, max: 52 },
  topicCount:       { min: 5, max: 50 },
  lessonsPerTopic:  { min: 2, max: 10 },
  learningOutcome:  { minItems: 3, maxItems: 20 },
  
  // Cross-field rules:
  derived: [
    { 
      rule: "topicCount × lessonsPerTopic × avgLessonHours ≤ durationWeeks × hoursPerWeek × 1.2",
      error: "Insufficient course hours for requested topic/lesson count"
    },
    {
      rule: "ageRange matches grade level (±1 year tolerance)",
      warning: "Age range does not match typical grade level"
    }
  ]
};
```

## Appendix B: Subject-Specific Knowledge Graph Seeds

Each subject has pre-built knowledge nodes seeded at deployment:

| Subject | Node Count | Core Concepts |
|---------|-----------|---------------|
| TOAN (Math) | 850+ nodes, Grades 1-12 | Number, Operations, Fractions, Algebra, Geometry, Statistics, Calculus |
| TIENG_ANH (English) | 600+ nodes | Phonics, Vocabulary, Grammar, Reading, Writing, Speaking |
| TIN_HOC (IT) | 400+ nodes | Digital Literacy, Office Suite, Internet Safety, Basic Programming |
| LAP_TRINH (Programming) | 500+ nodes | Variables, Control Flow, Functions, OOP, Algorithms, Data Structures |
| VAN (Literature) | 450+ nodes | Reading Comprehension, Writing, Literary Analysis, Grammar |
| LY (Physics) | 380+ nodes | Mechanics, Electricity, Optics, Thermodynamics, Modern Physics |
| HOA (Chemistry) | 350+ nodes | Matter, Reactions, Organic, Inorganic, Electrochemistry |
| SINH (Biology) | 320+ nodes | Cell Biology, Genetics, Ecology, Human Body, Evolution |
| SU (History) | 300+ nodes | Vietnamese History, World History, Historical Thinking |
| DIA (Geography) | 280+ nodes | Physical Geography, Human Geography, Map Skills, Vietnam Geography |

---

## Appendix C: Generator Version Log

| Version | Changes |
|---------|---------|
| 1.0.0 | Initial architecture — all 11 sections |

---

*Document end. AvaB Curriculum Generator Architecture v1.0.0.*  
*This document defines the SYSTEM — not content. Content is generated by the system at runtime.*
