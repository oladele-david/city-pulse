ALTER TABLE "issues"
ADD COLUMN "photo_urls" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "video_url" TEXT;

UPDATE "issues"
SET "photo_urls" = CASE
  WHEN "photo_url" IS NULL THEN '[]'::jsonb
  ELSE jsonb_build_array("photo_url")
END;

ALTER TABLE "issues"
DROP COLUMN "photo_url";
