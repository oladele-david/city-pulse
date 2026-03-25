-- Create enums
CREATE TYPE "Role" AS ENUM ('citizen', 'admin');
CREATE TYPE "Rank" AS ENUM ('NEW', 'RELIABLE', 'TRUSTED', 'COMMUNITY_SENTINEL');
CREATE TYPE "Severity" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "IssueStatus" AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE "ConfidenceBand" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "ReactionType" AS ENUM ('confirm', 'disagree', 'fixed_signal', 'none');
CREATE TYPE "PaymentType" AS ENUM ('sanitation_levy', 'environmental_fee', 'community_due');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'initialized', 'succeeded', 'failed');
CREATE TYPE "LedgerReason" AS ENUM (
  'report_submitted',
  'report_validated',
  'report_kept_valid',
  'confirm_issue',
  'valid_confirmation',
  'correct_disagreement',
  'fixed_signal_match',
  'false_report',
  'invalid_reaction',
  'fraud_abuse'
);

-- Create tables
CREATE TABLE "states" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lgas" (
  "id" TEXT NOT NULL,
  "state_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "latitude" DECIMAL(9,6) NOT NULL,
  "longitude" DECIMAL(9,6) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "lgas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "communities" (
  "id" TEXT NOT NULL,
  "lga_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "latitude" DECIMAL(9,6) NOT NULL,
  "longitude" DECIMAL(9,6) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "communities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "lga_id" TEXT NOT NULL,
  "community_id" TEXT NOT NULL,
  "street_or_area" TEXT NOT NULL,
  "points" INTEGER NOT NULL DEFAULT 0,
  "rank" "Rank" NOT NULL DEFAULT 'NEW',
  "trust_weight" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "issues" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "severity" "Severity" NOT NULL,
  "status" "IssueStatus" NOT NULL DEFAULT 'open',
  "confidence_score" INTEGER NOT NULL,
  "confidence_band" "ConfidenceBand" NOT NULL,
  "reported_by_user_id" TEXT NOT NULL,
  "reporter_trust_weight" DECIMAL(4,2) NOT NULL,
  "lga_id" TEXT NOT NULL,
  "community_id" TEXT NOT NULL,
  "street_or_landmark" TEXT NOT NULL,
  "latitude" DECIMAL(9,6) NOT NULL,
  "longitude" DECIMAL(9,6) NOT NULL,
  "photo_url" TEXT,
  "confirmations_count" INTEGER NOT NULL DEFAULT 0,
  "disagreements_count" INTEGER NOT NULL DEFAULT 0,
  "fixed_signals_count" INTEGER NOT NULL DEFAULT 0,
  "needs_resolution_review" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "issue_reactions" (
  "id" TEXT NOT NULL,
  "issue_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "reaction" "ReactionType" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "issue_reactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "points_ledger" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "reason" "LedgerReason" NOT NULL,
  "points_delta" INTEGER NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "points_ledger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "payment_type" "PaymentType" NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
  "checkout_url" TEXT,
  "provider_reference" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_webhooks" (
  "id" TEXT NOT NULL,
  "payment_id" TEXT NOT NULL,
  "event_id" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_webhooks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leaderboard_snapshots" (
  "id" TEXT NOT NULL,
  "community_id" TEXT NOT NULL,
  "street_or_area" TEXT,
  "score" INTEGER NOT NULL,
  "resolved_count" INTEGER NOT NULL DEFAULT 0,
  "unresolved_count" INTEGER NOT NULL DEFAULT 0,
  "freshness_bonus" INTEGER NOT NULL DEFAULT 0,
  "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "issue_reactions_issue_id_user_id_key" ON "issue_reactions"("issue_id", "user_id");
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");
CREATE UNIQUE INDEX "payment_webhooks_event_id_key" ON "payment_webhooks"("event_id");

-- Create indexes
CREATE INDEX "lgas_state_id_idx" ON "lgas"("state_id");
CREATE INDEX "communities_lga_id_idx" ON "communities"("lga_id");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_lga_id_idx" ON "users"("lga_id");
CREATE INDEX "users_community_id_idx" ON "users"("community_id");
CREATE INDEX "issues_status_created_at_idx" ON "issues"("status", "created_at" DESC);
CREATE INDEX "issues_lga_id_community_id_created_at_idx" ON "issues"("lga_id", "community_id", "created_at" DESC);
CREATE INDEX "issues_type_latitude_longitude_idx" ON "issues"("type", "latitude", "longitude");
CREATE INDEX "issue_reactions_user_id_reaction_idx" ON "issue_reactions"("user_id", "reaction");
CREATE INDEX "points_ledger_user_id_created_at_idx" ON "points_ledger"("user_id", "created_at" DESC);
CREATE INDEX "payments_user_id_created_at_idx" ON "payments"("user_id", "created_at" DESC);
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at" DESC);
CREATE INDEX "payment_webhooks_payment_id_idx" ON "payment_webhooks"("payment_id");
CREATE INDEX "leaderboard_snapshots_community_id_computed_at_idx" ON "leaderboard_snapshots"("community_id", "computed_at" DESC);

-- Add foreign keys
ALTER TABLE "lgas"
ADD CONSTRAINT "lgas_state_id_fkey"
FOREIGN KEY ("state_id") REFERENCES "states"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "communities"
ADD CONSTRAINT "communities_lga_id_fkey"
FOREIGN KEY ("lga_id") REFERENCES "lgas"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "users"
ADD CONSTRAINT "users_lga_id_fkey"
FOREIGN KEY ("lga_id") REFERENCES "lgas"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "users"
ADD CONSTRAINT "users_community_id_fkey"
FOREIGN KEY ("community_id") REFERENCES "communities"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "issues"
ADD CONSTRAINT "issues_reported_by_user_id_fkey"
FOREIGN KEY ("reported_by_user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "issues"
ADD CONSTRAINT "issues_lga_id_fkey"
FOREIGN KEY ("lga_id") REFERENCES "lgas"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "issues"
ADD CONSTRAINT "issues_community_id_fkey"
FOREIGN KEY ("community_id") REFERENCES "communities"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "issue_reactions"
ADD CONSTRAINT "issue_reactions_issue_id_fkey"
FOREIGN KEY ("issue_id") REFERENCES "issues"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "issue_reactions"
ADD CONSTRAINT "issue_reactions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "points_ledger"
ADD CONSTRAINT "points_ledger_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments"
ADD CONSTRAINT "payments_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payment_webhooks"
ADD CONSTRAINT "payment_webhooks_payment_id_fkey"
FOREIGN KEY ("payment_id") REFERENCES "payments"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "leaderboard_snapshots"
ADD CONSTRAINT "leaderboard_snapshots_community_id_fkey"
FOREIGN KEY ("community_id") REFERENCES "communities"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
