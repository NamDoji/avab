-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PER_COURSE', 'PER_SESSION');

-- CreateTable
CREATE TABLE "avab_users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "avatar" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aiRefreshedAt" TIMESTAMP(3),

    CONSTRAINT "avab_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_learner_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "backgroundLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
    "learningStyle" TEXT NOT NULL DEFAULT 'MIXED',
    "selfStudyCapacity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "parentInvolvement" TEXT NOT NULL DEFAULT 'MEDIUM',
    "weeklyHours" INTEGER NOT NULL DEFAULT 5,
    "targetSchool" TEXT,
    "targetDate" TIMESTAMP(3),
    "targetGoal" TEXT NOT NULL DEFAULT 'SCHOLARSHIP',
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_learner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_courses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "price" INTEGER DEFAULT 0,
    "courseType" TEXT NOT NULL DEFAULT 'TOAN',
    "subjectCode" TEXT NOT NULL DEFAULT 'GENERAL',
    "subjectName" TEXT,
    "gradeMin" INTEGER,
    "gradeMax" INTEGER,
    "curriculumId" TEXT,
    "paymentType" "PaymentType" NOT NULL DEFAULT 'PER_COURSE',
    "pricePerSession" INTEGER,
    "courseDurationMonths" INTEGER NOT NULL DEFAULT 18,
    "grade" TEXT,
    "homeworkCount" INTEGER NOT NULL DEFAULT 30,
    "quizCount" INTEGER NOT NULL DEFAULT 20,
    "organizationId" TEXT,
    "campusId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_curricula" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gradeMin" INTEGER,
    "gradeMax" INTEGER,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_enrollments" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "campusId" TEXT,
    "academicYearId" TEXT,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "parentName" TEXT,
    "pausedAt" TIMESTAMP(3),
    "resumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_subjects" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "organizationId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_homework_sets" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "organizationId" TEXT,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "fileUrl" TEXT,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiGeneratorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_homework_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_subject_materials" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_subject_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_questions" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "organizationId" TEXT,
    "homeworkSetId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "questionType" TEXT NOT NULL DEFAULT 'OPEN',
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "audioUrl" TEXT,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_student_answers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_news" (
    "organizationId" TEXT,
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "thumbnail" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_recruitments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "benefits" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_recruitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_tuition_collections" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "campusId" TEXT,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "unitAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_tuition_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_tuition_payments" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_tuition_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_session_feedbacks" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "campusId" TEXT,
    "subjectId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionNote" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_session_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_student_session_records" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendance" BOOLEAN NOT NULL DEFAULT true,
    "focusLevel" INTEGER,
    "participationLevel" INTEGER,
    "speakingCount" INTEGER,
    "answerQuality" INTEGER,
    "comprehension" INTEGER,
    "discipline" INTEGER,
    "observation" INTEGER,
    "comparison" INTEGER,
    "classification" INTEGER,
    "patternRecognition" INTEGER,
    "expression" INTEGER,
    "emotionState" TEXT,
    "teacherNote" TEXT,
    "aiComment" TEXT,
    "aiCommentAt" TIMESTAMP(3),
    "hwScore" INTEGER,
    "hwCorrect" INTEGER,
    "hwTotal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_student_session_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_ai_quiz_gen_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "genCount" INTEGER NOT NULL DEFAULT 0,
    "lastScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_ai_quiz_gen_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_ai_analysis_cache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_ai_analysis_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_parent_student_links" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_parent_student_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_ai_projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "curriculum" TEXT NOT NULL DEFAULT 'K12-VN',
    "grade" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "subjectName" TEXT,
    "chapter" TEXT,
    "topic" TEXT NOT NULL,
    "objective" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "organizationId" TEXT,
    "campusId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_ai_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_ai_project_steps" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "stepType" TEXT NOT NULL,
    "stepNum" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "content" TEXT,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3),
    "doneAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "avab_ai_project_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "domain" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CENTER',
    "country" TEXT NOT NULL DEFAULT 'VN',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "modules" JSONB,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "avab_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_campuses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "principalId" TEXT,
    "settings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_campuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_organization_users" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgRole" TEXT NOT NULL DEFAULT 'MEMBER',
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_organization_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_campus_users" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "campusRole" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_campus_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_academic_years" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_permissions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'gray',
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "avab_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "scopeType" TEXT,
    "scopeId" TEXT,
    "grantedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "summary" TEXT,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "domain" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#7c3aed',
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_school_settings" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "allowSelfRegister" BOOLEAN NOT NULL DEFAULT false,
    "maxStudents" INTEGER,
    "features" JSONB,
    "customCSS" TEXT,

    CONSTRAINT "avab_school_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_school_users" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',

    CONSTRAINT "avab_school_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_school_courses" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "avab_school_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_workflow_defs" (
    "organizationId" TEXT,
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL DEFAULT 'general',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "steps" JSONB NOT NULL,
    "formSchema" JSONB,
    "settings" JSONB,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_workflow_defs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_workflow_instances" (
    "organizationId" TEXT,
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'running',
    "currentStep" TEXT NOT NULL,
    "data" JSONB,
    "startedBy" TEXT,
    "assignedTo" TEXT,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_workflow_history" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "note" TEXT,
    "data" JSONB,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_workflow_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_migration_logs" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "successRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "mapping" JSONB,
    "errors" JSONB,
    "summary" JSONB,
    "importedBy" TEXT,
    "canRollback" BOOLEAN NOT NULL DEFAULT true,
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "avab_migration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_material_import_logs" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceSize" INTEGER NOT NULL DEFAULT 0,
    "detectedType" TEXT,
    "detectedSubject" TEXT,
    "detectedGrade" TEXT,
    "targetModule" TEXT,
    "targetId" TEXT,
    "mappingData" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "questionsFound" INTEGER NOT NULL DEFAULT 0,
    "questionsImported" INTEGER NOT NULL DEFAULT 0,
    "errorsJson" JSONB,
    "aiAnalysis" TEXT,
    "importedBy" TEXT,
    "subjectId" TEXT,
    "canRollback" BOOLEAN NOT NULL DEFAULT true,
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "avab_material_import_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_badges" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'yellow',
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "coinReward" INTEGER NOT NULL DEFAULT 0,
    "condition" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_missions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'daily',
    "target" INTEGER NOT NULL DEFAULT 1,
    "metric" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "coinReward" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_user_missions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "resetAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_user_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "coin" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "totalAnswers" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "lessonsViewed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_xp_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_xp_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_job_queue" (
    "id" TEXT NOT NULL,
    "courseId" TEXT,
    "subjectId" TEXT,
    "jobType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "done" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "error" TEXT,
    "createdBy" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_job_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_content_versions" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "content" TEXT NOT NULL,
    "label" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_classrooms" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 30,
    "type" TEXT NOT NULL DEFAULT 'standard',
    "floor" INTEGER,
    "building" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_attendance" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'present',
    "note" TEXT,
    "markedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_reward_discipline" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_reward_discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_health_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "organizationId" TEXT,
    "bloodType" TEXT,
    "allergies" TEXT,
    "conditions" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "insuranceNo" TEXT,
    "insuranceExpiry" TIMESTAMP(3),
    "lastCheckup" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_health_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_registrations" (
    "organizationId" TEXT,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "note" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CONTACT',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "note2" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_timetable_slots" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "campusId" TEXT,
    "versionId" TEXT,
    "courseId" TEXT NOT NULL,
    "subjectId" TEXT,
    "teacherId" TEXT,
    "roomId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "semesterId" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_timetable_versions" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "campusId" TEXT,
    "semesterId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "score" DOUBLE PRECISION,
    "conflicts" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "avab_timetable_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_education_level_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "levelName" TEXT NOT NULL,
    "periodsPerDay" INTEGER NOT NULL DEFAULT 5,
    "periodDuration" INTEGER NOT NULL DEFAULT 45,
    "breakAfterPeriod" INTEGER,
    "startTime" TEXT NOT NULL DEFAULT '07:30',
    "workingDays" JSONB,
    "periodSchedule" JSONB,
    "subjectsPerWeek" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_education_level_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_holiday_calendar" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'holiday',
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_holiday_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_timetable_rules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT,
    "ruleType" TEXT NOT NULL,
    "ruleScope" TEXT NOT NULL DEFAULT 'all',
    "scopeValue" TEXT,
    "value" JSONB NOT NULL,
    "isHard" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_timetable_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_teacher_availability" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "periodFrom" INTEGER NOT NULL,
    "periodTo" INTEGER NOT NULL,
    "campusId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_teacher_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_leave_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_timesheets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "hoursWorked" DOUBLE PRECISION,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_vouchers" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "minOrderAmount" DOUBLE PRECISION,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_scholarships" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT,
    "reason" TEXT,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_installment_plans" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "organizationId" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "installments" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_installment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_api_keys" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_webhook_endpoints" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastDeliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_equipment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "campusId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "category" TEXT NOT NULL DEFAULT 'other',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "location" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_alumni_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "graduationYear" INTEGER NOT NULL,
    "finalGrade" TEXT,
    "nextSchool" TEXT,
    "achievements" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_alumni_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_kpi_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "period" TEXT NOT NULL,
    "targets" JSONB NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "rating" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_kpi_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_contracts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "salary" DOUBLE PRECISION,
    "position" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_class_transfers" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fromCourseId" TEXT NOT NULL,
    "toCourseId" TEXT NOT NULL,
    "organizationId" TEXT,
    "reason" TEXT,
    "transferDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_class_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "title" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_homework_submissions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "materialId" TEXT,
    "content" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),
    "gradedBy" TEXT,

    CONSTRAINT "avab_homework_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_bus_routes" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "stops" JSONB NOT NULL DEFAULT '[]',
    "driverName" TEXT,
    "driverPhone" TEXT,
    "vehicleNumber" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 45,
    "feePerMonth" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_bus_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_bus_assignments" (
    "id" TEXT NOT NULL,
    "busRouteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "avab_bus_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_uniform_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SHIRT',
    "color" TEXT,
    "sizes" JSONB NOT NULL DEFAULT '[]',
    "pricePerUnit" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_uniform_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_uniform_orders" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "uniformItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_uniform_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avab_users_phone_key" ON "avab_users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "avab_users_email_key" ON "avab_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "avab_learner_profiles_userId_key" ON "avab_learner_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_courses_code_key" ON "avab_courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "avab_curricula_code_key" ON "avab_curricula"("code");

-- CreateIndex
CREATE UNIQUE INDEX "avab_enrollments_userId_courseId_key" ON "avab_enrollments"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_student_answers_userId_questionId_key" ON "avab_student_answers"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_news_slug_key" ON "avab_news"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "avab_tuition_payments_collectionId_enrollmentId_key" ON "avab_tuition_payments"("collectionId", "enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_student_session_records_feedbackId_userId_key" ON "avab_student_session_records"("feedbackId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_ai_quiz_gen_log_userId_subjectId_key" ON "avab_ai_quiz_gen_log"("userId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_ai_analysis_cache_userId_analysisType_key" ON "avab_ai_analysis_cache"("userId", "analysisType");

-- CreateIndex
CREATE UNIQUE INDEX "avab_parent_student_links_parentId_studentId_key" ON "avab_parent_student_links"("parentId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_organizations_slug_key" ON "avab_organizations"("slug");

-- CreateIndex
CREATE INDEX "avab_campuses_organizationId_idx" ON "avab_campuses"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_organization_users_organizationId_userId_key" ON "avab_organization_users"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_campus_users_campusId_userId_key" ON "avab_campus_users"("campusId", "userId");

-- CreateIndex
CREATE INDEX "avab_academic_years_organizationId_idx" ON "avab_academic_years"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_permissions_key_key" ON "avab_permissions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "avab_roles_name_key" ON "avab_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "avab_roles_slug_key" ON "avab_roles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "avab_role_permissions_roleId_permissionId_key" ON "avab_role_permissions"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "avab_user_roles_userId_idx" ON "avab_user_roles"("userId");

-- CreateIndex
CREATE INDEX "avab_user_roles_roleId_idx" ON "avab_user_roles"("roleId");

-- CreateIndex
CREATE INDEX "avab_audit_logs_userId_idx" ON "avab_audit_logs"("userId");

-- CreateIndex
CREATE INDEX "avab_audit_logs_entityType_entityId_idx" ON "avab_audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "avab_audit_logs_createdAt_idx" ON "avab_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "avab_schools_slug_key" ON "avab_schools"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "avab_schools_domain_key" ON "avab_schools"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "avab_school_settings_schoolId_key" ON "avab_school_settings"("schoolId");

-- CreateIndex
CREATE INDEX "avab_school_users_schoolId_idx" ON "avab_school_users"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_school_users_schoolId_userId_key" ON "avab_school_users"("schoolId", "userId");

-- CreateIndex
CREATE INDEX "avab_school_courses_schoolId_idx" ON "avab_school_courses"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_school_courses_schoolId_courseId_key" ON "avab_school_courses"("schoolId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_workflow_defs_slug_key" ON "avab_workflow_defs"("slug");

-- CreateIndex
CREATE INDEX "avab_workflow_instances_workflowId_idx" ON "avab_workflow_instances"("workflowId");

-- CreateIndex
CREATE INDEX "avab_workflow_instances_status_idx" ON "avab_workflow_instances"("status");

-- CreateIndex
CREATE INDEX "avab_workflow_instances_entityType_entityId_idx" ON "avab_workflow_instances"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "avab_workflow_history_instanceId_idx" ON "avab_workflow_history"("instanceId");

-- CreateIndex
CREATE INDEX "avab_migration_logs_status_idx" ON "avab_migration_logs"("status");

-- CreateIndex
CREATE INDEX "avab_migration_logs_module_idx" ON "avab_migration_logs"("module");

-- CreateIndex
CREATE INDEX "avab_material_import_logs_importedBy_idx" ON "avab_material_import_logs"("importedBy");

-- CreateIndex
CREATE INDEX "avab_material_import_logs_status_idx" ON "avab_material_import_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "avab_badges_key_key" ON "avab_badges"("key");

-- CreateIndex
CREATE UNIQUE INDEX "avab_user_badges_userId_badgeId_key" ON "avab_user_badges"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_missions_key_key" ON "avab_missions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "avab_user_missions_userId_missionId_key" ON "avab_user_missions"("userId", "missionId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_user_stats_userId_key" ON "avab_user_stats"("userId");

-- CreateIndex
CREATE INDEX "avab_xp_logs_userId_idx" ON "avab_xp_logs"("userId");

-- CreateIndex
CREATE INDEX "avab_job_queue_courseId_idx" ON "avab_job_queue"("courseId");

-- CreateIndex
CREATE INDEX "avab_job_queue_status_idx" ON "avab_job_queue"("status");

-- CreateIndex
CREATE INDEX "avab_content_versions_entityId_idx" ON "avab_content_versions"("entityId");

-- CreateIndex
CREATE INDEX "avab_attendance_courseId_date_idx" ON "avab_attendance"("courseId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "avab_attendance_courseId_userId_date_key" ON "avab_attendance"("courseId", "userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "avab_health_records_studentId_key" ON "avab_health_records"("studentId");

-- CreateIndex
CREATE INDEX "avab_timetable_slots_campusId_dayOfWeek_period_idx" ON "avab_timetable_slots"("campusId", "dayOfWeek", "period");

-- CreateIndex
CREATE INDEX "avab_timetable_slots_teacherId_dayOfWeek_period_idx" ON "avab_timetable_slots"("teacherId", "dayOfWeek", "period");

-- CreateIndex
CREATE INDEX "avab_timetable_slots_courseId_idx" ON "avab_timetable_slots"("courseId");

-- CreateIndex
CREATE INDEX "avab_timetable_slots_versionId_idx" ON "avab_timetable_slots"("versionId");

-- CreateIndex
CREATE INDEX "avab_timetable_versions_campusId_idx" ON "avab_timetable_versions"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_education_level_configs_organizationId_level_key" ON "avab_education_level_configs"("organizationId", "level");

-- CreateIndex
CREATE INDEX "avab_holiday_calendar_organizationId_startDate_idx" ON "avab_holiday_calendar"("organizationId", "startDate");

-- CreateIndex
CREATE INDEX "avab_timetable_rules_organizationId_idx" ON "avab_timetable_rules"("organizationId");

-- CreateIndex
CREATE INDEX "avab_teacher_availability_teacherId_idx" ON "avab_teacher_availability"("teacherId");

-- CreateIndex
CREATE INDEX "avab_leave_requests_userId_idx" ON "avab_leave_requests"("userId");

-- CreateIndex
CREATE INDEX "avab_leave_requests_status_idx" ON "avab_leave_requests"("status");

-- CreateIndex
CREATE INDEX "avab_timesheets_userId_date_idx" ON "avab_timesheets"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "avab_vouchers_code_key" ON "avab_vouchers"("code");

-- CreateIndex
CREATE INDEX "avab_scholarships_studentId_idx" ON "avab_scholarships"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_api_keys_key_key" ON "avab_api_keys"("key");

-- CreateIndex
CREATE INDEX "avab_api_keys_organizationId_idx" ON "avab_api_keys"("organizationId");

-- CreateIndex
CREATE INDEX "avab_webhook_endpoints_organizationId_idx" ON "avab_webhook_endpoints"("organizationId");

-- CreateIndex
CREATE INDEX "avab_equipment_campusId_idx" ON "avab_equipment"("campusId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_alumni_records_userId_key" ON "avab_alumni_records"("userId");

-- CreateIndex
CREATE INDEX "avab_kpi_records_userId_idx" ON "avab_kpi_records"("userId");

-- CreateIndex
CREATE INDEX "avab_contracts_userId_idx" ON "avab_contracts"("userId");

-- CreateIndex
CREATE INDEX "avab_class_transfers_organizationId_idx" ON "avab_class_transfers"("organizationId");

-- CreateIndex
CREATE INDEX "avab_notifications_userId_idx" ON "avab_notifications"("userId");

-- CreateIndex
CREATE INDEX "avab_homework_submissions_studentId_subjectId_idx" ON "avab_homework_submissions"("studentId", "subjectId");

-- CreateIndex
CREATE INDEX "avab_bus_routes_organizationId_idx" ON "avab_bus_routes"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_bus_assignments_busRouteId_userId_key" ON "avab_bus_assignments"("busRouteId", "userId");

-- CreateIndex
CREATE INDEX "avab_uniform_items_organizationId_idx" ON "avab_uniform_items"("organizationId");

-- CreateIndex
CREATE INDEX "avab_uniform_orders_organizationId_idx" ON "avab_uniform_orders"("organizationId");

-- AddForeignKey
ALTER TABLE "avab_learner_profiles" ADD CONSTRAINT "avab_learner_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_courses" ADD CONSTRAINT "avab_courses_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "avab_curricula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_courses" ADD CONSTRAINT "avab_courses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_enrollments" ADD CONSTRAINT "avab_enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_enrollments" ADD CONSTRAINT "avab_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "avab_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_subjects" ADD CONSTRAINT "avab_subjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "avab_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_subjects" ADD CONSTRAINT "avab_subjects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_homework_sets" ADD CONSTRAINT "avab_homework_sets_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "avab_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_homework_sets" ADD CONSTRAINT "avab_homework_sets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_subject_materials" ADD CONSTRAINT "avab_subject_materials_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "avab_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_questions" ADD CONSTRAINT "avab_questions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "avab_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_questions" ADD CONSTRAINT "avab_questions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_questions" ADD CONSTRAINT "avab_questions_homeworkSetId_fkey" FOREIGN KEY ("homeworkSetId") REFERENCES "avab_homework_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_student_answers" ADD CONSTRAINT "avab_student_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_student_answers" ADD CONSTRAINT "avab_student_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "avab_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_tuition_collections" ADD CONSTRAINT "avab_tuition_collections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "avab_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_tuition_payments" ADD CONSTRAINT "avab_tuition_payments_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "avab_tuition_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_tuition_payments" ADD CONSTRAINT "avab_tuition_payments_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "avab_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_session_feedbacks" ADD CONSTRAINT "avab_session_feedbacks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "avab_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_student_session_records" ADD CONSTRAINT "avab_student_session_records_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "avab_session_feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_student_session_records" ADD CONSTRAINT "avab_student_session_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_ai_analysis_cache" ADD CONSTRAINT "avab_ai_analysis_cache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_parent_student_links" ADD CONSTRAINT "avab_parent_student_links_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_parent_student_links" ADD CONSTRAINT "avab_parent_student_links_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_ai_projects" ADD CONSTRAINT "avab_ai_projects_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "avab_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_ai_projects" ADD CONSTRAINT "avab_ai_projects_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_ai_project_steps" ADD CONSTRAINT "avab_ai_project_steps_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "avab_ai_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_campuses" ADD CONSTRAINT "avab_campuses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_organization_users" ADD CONSTRAINT "avab_organization_users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_organization_users" ADD CONSTRAINT "avab_organization_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_campus_users" ADD CONSTRAINT "avab_campus_users_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "avab_campuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_campus_users" ADD CONSTRAINT "avab_campus_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_role_permissions" ADD CONSTRAINT "avab_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "avab_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_role_permissions" ADD CONSTRAINT "avab_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "avab_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_user_roles" ADD CONSTRAINT "avab_user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_user_roles" ADD CONSTRAINT "avab_user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "avab_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_audit_logs" ADD CONSTRAINT "avab_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_school_settings" ADD CONSTRAINT "avab_school_settings_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "avab_schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_school_users" ADD CONSTRAINT "avab_school_users_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "avab_schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_school_users" ADD CONSTRAINT "avab_school_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_school_courses" ADD CONSTRAINT "avab_school_courses_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "avab_schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_school_courses" ADD CONSTRAINT "avab_school_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "avab_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_workflow_instances" ADD CONSTRAINT "avab_workflow_instances_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "avab_workflow_defs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_workflow_history" ADD CONSTRAINT "avab_workflow_history_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "avab_workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_user_badges" ADD CONSTRAINT "avab_user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_user_badges" ADD CONSTRAINT "avab_user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "avab_badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_user_missions" ADD CONSTRAINT "avab_user_missions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_user_missions" ADD CONSTRAINT "avab_user_missions_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "avab_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_user_stats" ADD CONSTRAINT "avab_user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_classrooms" ADD CONSTRAINT "avab_classrooms_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_health_records" ADD CONSTRAINT "avab_health_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "avab_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_alumni_records" ADD CONSTRAINT "avab_alumni_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_kpi_records" ADD CONSTRAINT "avab_kpi_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_contracts" ADD CONSTRAINT "avab_contracts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_class_transfers" ADD CONSTRAINT "avab_class_transfers_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "avab_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_class_transfers" ADD CONSTRAINT "avab_class_transfers_fromCourseId_fkey" FOREIGN KEY ("fromCourseId") REFERENCES "avab_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_class_transfers" ADD CONSTRAINT "avab_class_transfers_toCourseId_fkey" FOREIGN KEY ("toCourseId") REFERENCES "avab_courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_notifications" ADD CONSTRAINT "avab_notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_homework_submissions" ADD CONSTRAINT "avab_homework_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "avab_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_homework_submissions" ADD CONSTRAINT "avab_homework_submissions_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "avab_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_bus_routes" ADD CONSTRAINT "avab_bus_routes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_bus_assignments" ADD CONSTRAINT "avab_bus_assignments_busRouteId_fkey" FOREIGN KEY ("busRouteId") REFERENCES "avab_bus_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_bus_assignments" ADD CONSTRAINT "avab_bus_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_uniform_items" ADD CONSTRAINT "avab_uniform_items_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_uniform_orders" ADD CONSTRAINT "avab_uniform_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_uniform_orders" ADD CONSTRAINT "avab_uniform_orders_uniformItemId_fkey" FOREIGN KEY ("uniformItemId") REFERENCES "avab_uniform_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_uniform_orders" ADD CONSTRAINT "avab_uniform_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

