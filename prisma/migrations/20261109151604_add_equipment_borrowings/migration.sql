-- CreateTable
CREATE TABLE "equipment_borrowings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "borrowerId" INTEGER NOT NULL,
    "approvedById" INTEGER,
    "quantity" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "borrowDate" DATETIME NOT NULL,
    "expectedReturnDate" DATETIME NOT NULL,
    "actualReturnDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'Chờ duyệt',
    "approvedAt" DATETIME,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "equipment_borrowings_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "equipment_borrowings_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "equipment_borrowings_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "equipment_borrowings_code_key" ON "equipment_borrowings"("code");

-- CreateIndex
CREATE INDEX "equipment_borrowings_equipmentId_idx" ON "equipment_borrowings"("equipmentId");

-- CreateIndex
CREATE INDEX "equipment_borrowings_borrowerId_idx" ON "equipment_borrowings"("borrowerId");

-- CreateIndex
CREATE INDEX "equipment_borrowings_approvedById_idx" ON "equipment_borrowings"("approvedById");

-- CreateIndex
CREATE INDEX "equipment_borrowings_status_idx" ON "equipment_borrowings"("status");
