ALTER TABLE "incidents" ADD COLUMN "reportedById" INTEGER REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "incidents_reportedById_idx" ON "incidents"("reportedById");
