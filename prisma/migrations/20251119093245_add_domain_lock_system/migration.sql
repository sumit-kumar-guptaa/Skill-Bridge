-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "domain" VARCHAR(20) NOT NULL DEFAULT 'SDE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "completed_domains" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "domain_started_at" TIMESTAMP(3),
ADD COLUMN     "selected_domain" TEXT;
