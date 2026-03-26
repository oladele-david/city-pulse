CREATE TYPE "LevyTargetType" AS ENUM ('community', 'lga');
CREATE TYPE "LevyStatus" AS ENUM ('draft', 'published', 'closed');

CREATE TABLE "levies" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "levy_type" "PaymentType" NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "due_date" TIMESTAMP(3) NOT NULL,
  "target_type" "LevyTargetType" NOT NULL,
  "target_community_id" TEXT,
  "target_lga_id" TEXT,
  "status" "LevyStatus" NOT NULL DEFAULT 'draft',
  "created_by_admin_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "levies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_events" (
  "id" TEXT NOT NULL,
  "payment_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "status" "PaymentStatus",
  "payload" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "payments"
  ADD COLUMN "levy_id" TEXT,
  ADD COLUMN "gateway_provider" TEXT NOT NULL DEFAULT 'interswitch',
  ADD COLUMN "gateway_status" TEXT,
  ADD COLUMN "gateway_response_code" TEXT,
  ADD COLUMN "gateway_response_description" TEXT,
  ADD COLUMN "provider_payment_reference" TEXT,
  ADD COLUMN "provider_retrieval_reference_number" TEXT,
  ADD COLUMN "provider_transaction_date" TIMESTAMP(3),
  ADD COLUMN "last_webhook_event_id" TEXT,
  ADD COLUMN "confirmed_at" TIMESTAMP(3),
  ADD COLUMN "failed_at" TIMESTAMP(3);

ALTER TABLE "payment_webhooks"
  ADD COLUMN "event_name" TEXT,
  ADD COLUMN "signature" TEXT,
  ADD COLUMN "is_signature_valid" BOOLEAN,
  ADD COLUMN "processed_at" TIMESTAMP(3);

ALTER TABLE "levies"
  ADD CONSTRAINT "levies_target_scope_check"
  CHECK (
    (
      "target_type" = 'community'
      AND "target_community_id" IS NOT NULL
      AND "target_lga_id" IS NULL
    )
    OR (
      "target_type" = 'lga'
      AND "target_lga_id" IS NOT NULL
      AND "target_community_id" IS NULL
    )
  );

ALTER TABLE "levies"
  ADD CONSTRAINT "levies_target_community_id_fkey"
  FOREIGN KEY ("target_community_id") REFERENCES "communities"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "levies"
  ADD CONSTRAINT "levies_target_lga_id_fkey"
  FOREIGN KEY ("target_lga_id") REFERENCES "lgas"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "levies"
  ADD CONSTRAINT "levies_created_by_admin_id_fkey"
  FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_levy_id_fkey"
  FOREIGN KEY ("levy_id") REFERENCES "levies"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payment_events"
  ADD CONSTRAINT "payment_events_payment_id_fkey"
  FOREIGN KEY ("payment_id") REFERENCES "payments"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "levies_status_due_date_idx" ON "levies"("status", "due_date" ASC);
CREATE INDEX "levies_target_type_status_due_date_idx" ON "levies"("target_type", "status", "due_date" ASC);
CREATE INDEX "levies_target_community_id_status_due_date_idx" ON "levies"("target_community_id", "status", "due_date" ASC);
CREATE INDEX "levies_target_lga_id_status_due_date_idx" ON "levies"("target_lga_id", "status", "due_date" ASC);
CREATE INDEX "levies_created_by_admin_id_created_at_idx" ON "levies"("created_by_admin_id", "created_at" DESC);

CREATE INDEX "payments_levy_id_status_created_at_idx" ON "payments"("levy_id", "status", "created_at" DESC);
CREATE UNIQUE INDEX "payments_user_id_levy_id_succeeded_key"
  ON "payments"("user_id", "levy_id")
  WHERE "levy_id" IS NOT NULL AND "status" = 'succeeded';

CREATE INDEX "payment_events_payment_id_created_at_idx" ON "payment_events"("payment_id", "created_at" DESC);
