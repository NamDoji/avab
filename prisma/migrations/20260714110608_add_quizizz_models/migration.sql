-- CreateTable
CREATE TABLE "avab_quiz_sets" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "organizationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "openedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "sourceType" TEXT NOT NULL DEFAULT 'upload',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avab_quiz_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_quiz_questions" (
    "id" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "options" JSONB,
    "correctKey" TEXT NOT NULL,
    "explanation" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_quiz_attempts" (
    "id" TEXT NOT NULL,
    "quizSetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avab_quiz_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedKey" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avab_quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "avab_quiz_attempts_quizSetId_userId_key" ON "avab_quiz_attempts"("quizSetId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "avab_quiz_answers_attemptId_questionId_key" ON "avab_quiz_answers"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "avab_quiz_sets" ADD CONSTRAINT "avab_quiz_sets_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "avab_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_quiz_sets" ADD CONSTRAINT "avab_quiz_sets_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "avab_organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_quiz_questions" ADD CONSTRAINT "avab_quiz_questions_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "avab_quiz_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_quiz_attempts" ADD CONSTRAINT "avab_quiz_attempts_quizSetId_fkey" FOREIGN KEY ("quizSetId") REFERENCES "avab_quiz_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_quiz_attempts" ADD CONSTRAINT "avab_quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "avab_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_quiz_answers" ADD CONSTRAINT "avab_quiz_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "avab_quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avab_quiz_answers" ADD CONSTRAINT "avab_quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "avab_quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
