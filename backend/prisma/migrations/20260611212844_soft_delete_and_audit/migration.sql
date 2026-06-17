-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN "afterData" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "beforeData" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "browser" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_email_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_email_templates" ("createdAt", "html", "id", "key", "subject", "updatedAt") SELECT "createdAt", "html", "id", "key", "subject", "updatedAt" FROM "email_templates";
DROP TABLE "email_templates";
ALTER TABLE "new_email_templates" RENAME TO "email_templates";
CREATE UNIQUE INDEX "email_templates_key_key" ON "email_templates"("key");
CREATE TABLE "new_modules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_modules" ("createdAt", "enabled", "id", "name") SELECT "createdAt", "enabled", "id", "name" FROM "modules";
DROP TABLE "modules";
ALTER TABLE "new_modules" RENAME TO "modules";
CREATE UNIQUE INDEX "modules_name_key" ON "modules"("name");
CREATE TABLE "new_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_roles" ("description", "id", "name") SELECT "description", "id", "name" FROM "roles";
DROP TABLE "roles";
ALTER TABLE "new_roles" RENAME TO "roles";
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE TABLE "new_ticket_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ticket_categories" ("enabled", "id", "name") SELECT "enabled", "id", "name" FROM "ticket_categories";
DROP TABLE "ticket_categories";
ALTER TABLE "new_ticket_categories" RENAME TO "ticket_categories";
CREATE UNIQUE INDEX "ticket_categories_name_key" ON "ticket_categories"("name");
CREATE TABLE "new_ticket_priorities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "slaHours" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ticket_priorities" ("color", "enabled", "id", "name", "slaHours") SELECT "color", "enabled", "id", "name", "slaHours" FROM "ticket_priorities";
DROP TABLE "ticket_priorities";
ALTER TABLE "new_ticket_priorities" RENAME TO "ticket_priorities";
CREATE UNIQUE INDEX "ticket_priorities_name_key" ON "ticket_priorities"("name");
CREATE TABLE "new_ticket_status" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ticket_status" ("color", "enabled", "id", "name") SELECT "color", "enabled", "id", "name" FROM "ticket_status";
DROP TABLE "ticket_status";
ALTER TABLE "new_ticket_status" RENAME TO "ticket_status";
CREATE UNIQUE INDEX "ticket_status_name_key" ON "ticket_status"("name");
CREATE TABLE "new_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
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
    CONSTRAINT "tickets_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "ticket_priorities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tickets_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ticket_status" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tickets" ("area", "categoryId", "closedAt", "createdAt", "description", "id", "moduleId", "number", "position", "priorityId", "reopenedCount", "requesterId", "resolvedAt", "slaDueAt", "statusId", "subject", "updatedAt") SELECT "area", "categoryId", "closedAt", "createdAt", "description", "id", "moduleId", "number", "position", "priorityId", "reopenedCount", "requesterId", "resolvedAt", "slaDueAt", "statusId", "subject", "updatedAt" FROM "tickets";
DROP TABLE "tickets";
ALTER TABLE "new_tickets" RENAME TO "tickets";
CREATE UNIQUE INDEX "tickets_number_key" ON "tickets"("number");
CREATE INDEX "tickets_number_idx" ON "tickets"("number");
CREATE INDEX "tickets_statusId_priorityId_idx" ON "tickets"("statusId", "priorityId");
CREATE INDEX "tickets_createdAt_idx" ON "tickets"("createdAt");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "roleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_users" ("active", "area", "createdAt", "email", "failedLoginCount", "firstName", "id", "lastName", "lockedUntil", "passwordHash", "position", "roleId", "updatedAt") SELECT "active", "area", "createdAt", "email", "failedLoginCount", "firstName", "id", "lastName", "lockedUntil", "passwordHash", "position", "roleId", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
