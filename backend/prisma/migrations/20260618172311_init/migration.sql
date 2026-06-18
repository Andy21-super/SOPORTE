-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "requesterIp" TEXT,
    "area" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "typeId" TEXT,
    "priorityId" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slaDueAt" DATETIME,
    "resolvedAt" DATETIME,
    "closedAt" DATETIME,
    "reopenedCount" INTEGER NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tickets_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ticket_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ticket_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "tickets_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "ticket_priorities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ticket_status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tickets" ("area", "categoryId", "closedAt", "createdAt", "deleted", "description", "id", "moduleId", "number", "position", "priorityId", "reopenedCount", "requesterId", "resolvedAt", "slaDueAt", "statusId", "subject", "updatedAt") SELECT "area", "categoryId", "closedAt", "createdAt", "deleted", "description", "id", "moduleId", "number", "position", "priorityId", "reopenedCount", "requesterId", "resolvedAt", "slaDueAt", "statusId", "subject", "updatedAt" FROM "tickets";
DROP TABLE "tickets";
ALTER TABLE "new_tickets" RENAME TO "tickets";
CREATE UNIQUE INDEX "tickets_number_key" ON "tickets"("number");
CREATE INDEX "tickets_number_idx" ON "tickets"("number");
CREATE INDEX "tickets_typeId_idx" ON "tickets"("typeId");
CREATE INDEX "tickets_statusId_priorityId_idx" ON "tickets"("statusId", "priorityId");
CREATE INDEX "tickets_createdAt_idx" ON "tickets"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
