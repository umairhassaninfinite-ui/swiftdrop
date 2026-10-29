CREATE TABLE "staff_invitations" (
  "id" UUID NOT NULL,
  "user_id" INTEGER NOT NULL,
  "token_hash" CHAR(64) NOT NULL,
  "generation" INTEGER NOT NULL,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "consumed_at" TIMESTAMPTZ(3),
  "revoked_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "staff_invitations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "staff_invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "staff_invitations_generation_check" CHECK ("generation" > 0),
  CONSTRAINT "staff_invitations_expiry_check" CHECK ("expires_at" > "created_at")
);
CREATE UNIQUE INDEX "staff_invitations_token_hash_key" ON "staff_invitations"("token_hash");
CREATE INDEX "staff_invitations_user_id_generation_idx" ON "staff_invitations"("user_id", "generation");
CREATE INDEX "staff_invitations_expires_at_idx" ON "staff_invitations"("expires_at");
