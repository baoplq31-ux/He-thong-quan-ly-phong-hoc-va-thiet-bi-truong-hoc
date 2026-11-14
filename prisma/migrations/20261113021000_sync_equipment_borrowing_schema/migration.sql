ALTER TABLE "equipment" ADD COLUMN "availableQuantity" INTEGER NOT NULL DEFAULT 0;

UPDATE "equipment"
SET "availableQuantity" = CASE
    WHEN "status" = 'Hỏng' THEN 0
    ELSE MAX(
        0,
        "quantity"
        - COALESCE((
            SELECT SUM("quantity")
            FROM "equipment_borrowings"
            WHERE "equipmentId" = "equipment"."id"
              AND "status" IN ('Đã duyệt', 'Đang mượn', 'Quá hạn')
        ), 0)
        - COALESCE((
            SELECT SUM("quantity")
            FROM "maintenances"
            WHERE "equipmentId" = "equipment"."id"
              AND "status" = 'Đang xử lý'
        ), 0)
    )
END;

ALTER TABLE "equipment_borrowings" ADD COLUMN "returnedById" INTEGER REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "equipment_borrowings" ADD COLUMN "conditionBefore" TEXT;
ALTER TABLE "equipment_borrowings" ADD COLUMN "conditionAfter" TEXT;
ALTER TABLE "equipment_borrowings" ADD COLUMN "returnedAt" DATETIME;
ALTER TABLE "equipment_borrowings" ADD COLUMN "returnNote" TEXT;

CREATE INDEX IF NOT EXISTS "equipment_borrowings_returnedById_idx" ON "equipment_borrowings"("returnedById");
CREATE INDEX IF NOT EXISTS "equipment_borrowings_expectedReturnDate_idx" ON "equipment_borrowings"("expectedReturnDate");
