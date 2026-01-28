ALTER TABLE "document_versions" ALTER COLUMN "content" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "content" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "documents" ALTER COLUMN "content" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "document_versions" ADD COLUMN "version_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "document_versions" ADD COLUMN "title" varchar(500) NOT NULL;