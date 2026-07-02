-- Add HomeworkSet table
CREATE TABLE IF NOT EXISTS "avab_homework_sets" (
    "id"        TEXT         NOT NULL,
    "subjectId" TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "order"     INTEGER      NOT NULL DEFAULT 0,
    "fileUrl"   TEXT,
    "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT "avab_homework_sets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "avab_homework_sets_subjectId_fkey"
        FOREIGN KEY ("subjectId")
        REFERENCES "avab_subjects"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add homeworkSetId to avab_questions (nullable, references a set)
ALTER TABLE "avab_questions"
    ADD COLUMN IF NOT EXISTS "homeworkSetId" TEXT;

ALTER TABLE "avab_questions"
    DROP CONSTRAINT IF EXISTS "avab_questions_homeworkSetId_fkey";

ALTER TABLE "avab_questions"
    ADD CONSTRAINT "avab_questions_homeworkSetId_fkey"
        FOREIGN KEY ("homeworkSetId")
        REFERENCES "avab_homework_sets"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS "avab_homework_sets_subjectId_idx"
    ON "avab_homework_sets"("subjectId");

CREATE INDEX IF NOT EXISTS "avab_questions_homeworkSetId_idx"
    ON "avab_questions"("homeworkSetId");
