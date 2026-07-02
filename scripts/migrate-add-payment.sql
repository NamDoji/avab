-- Thêm enum PaymentType nếu chưa có
DO $$ BEGIN
  CREATE TYPE "PaymentType" AS ENUM ('PER_COURSE', 'PER_SESSION');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Thêm các cột mới vào avab_courses
ALTER TABLE avab_courses ADD COLUMN IF NOT EXISTS "paymentType" "PaymentType" NOT NULL DEFAULT 'PER_COURSE';
ALTER TABLE avab_courses ADD COLUMN IF NOT EXISTS "pricePerSession" INTEGER;
ALTER TABLE avab_courses ADD COLUMN IF NOT EXISTS "courseDurationMonths" INTEGER NOT NULL DEFAULT 18;
ALTER TABLE avab_courses ADD COLUMN IF NOT EXISTS "grade" TEXT;

-- Thêm các cột mới vào avab_enrollments
ALTER TABLE avab_enrollments ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE avab_enrollments ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

-- Thêm các cột mới vào avab_homework_sets
ALTER TABLE avab_homework_sets ADD COLUMN IF NOT EXISTS "isAIGenerated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE avab_homework_sets ADD COLUMN IF NOT EXISTS "aiGeneratorId" TEXT;

-- Tạo bảng TuitionCollection
CREATE TABLE IF NOT EXISTS avab_tuition_collections (
  id TEXT NOT NULL PRIMARY KEY,
  "courseId" TEXT NOT NULL,
  title TEXT NOT NULL,
  sessions INTEGER NOT NULL DEFAULT 0,
  "unitAmount" INTEGER NOT NULL DEFAULT 0,
  "totalAmount" INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_collection_course FOREIGN KEY ("courseId") REFERENCES avab_courses(id) ON DELETE CASCADE
);

-- Tạo bảng TuitionPayment
CREATE TABLE IF NOT EXISTS avab_tuition_payments (
  id TEXT NOT NULL PRIMARY KEY,
  "collectionId" TEXT NOT NULL,
  "enrollmentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  "isFree" BOOLEAN NOT NULL DEFAULT false,
  "isPaid" BOOLEAN NOT NULL DEFAULT false,
  "paidAt" TIMESTAMP(3),
  note TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_collection FOREIGN KEY ("collectionId") REFERENCES avab_tuition_collections(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_enrollment FOREIGN KEY ("enrollmentId") REFERENCES avab_enrollments(id) ON DELETE CASCADE,
  CONSTRAINT uq_collection_enrollment UNIQUE ("collectionId", "enrollmentId")
);

-- Tạo bảng AIQuizGenLog
CREATE TABLE IF NOT EXISTS avab_ai_quiz_gen_log (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "subjectId" TEXT NOT NULL,
  "genCount" INTEGER NOT NULL DEFAULT 0,
  "lastScore" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_subject UNIQUE ("userId", "subjectId")
);
