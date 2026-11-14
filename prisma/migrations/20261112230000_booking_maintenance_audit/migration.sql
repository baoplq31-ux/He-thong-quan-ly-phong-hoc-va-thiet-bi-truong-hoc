ALTER TABLE "bookings" ADD COLUMN "attendeeCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "bookings" ADD COLUMN "note" TEXT;
ALTER TABLE "bookings" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "bookings" ADD COLUMN "userId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD COLUMN "approvedById" INTEGER REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD COLUMN "approvedAt" DATETIME;
ALTER TABLE "bookings" ADD COLUMN "cancelledAt" DATETIME;
ALTER TABLE "bookings" ADD COLUMN "completedAt" DATETIME;

CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");
CREATE INDEX "bookings_approvedById_idx" ON "bookings"("approvedById");
CREATE INDEX "bookings_status_date_idx" ON "bookings"("status", "date");

CREATE TABLE "maintenances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "equipmentId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "type" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "content" TEXT NOT NULL,
    "assignedTo" TEXT,
    "repairResult" TEXT,
    "conditionAfter" TEXT,
    "cost" REAL,
    "status" TEXT NOT NULL DEFAULT 'Đang xử lý',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "maintenances_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "maintenances_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "maintenances_equipmentId_idx" ON "maintenances"("equipmentId");
CREATE INDEX "maintenances_createdById_idx" ON "maintenances"("createdById");
CREATE INDEX "maintenances_status_idx" ON "maintenances"("status");

CREATE TABLE "audit_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "objectId" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");
CREATE INDEX "audit_logs_module_objectId_idx" ON "audit_logs"("module", "objectId");
