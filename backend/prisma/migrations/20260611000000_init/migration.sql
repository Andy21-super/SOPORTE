PRAGMA foreign_keys=OFF;

CREATE TABLE "roles" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT
);

CREATE TABLE "permissions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL
);

CREATE TABLE "role_permissions" (
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  PRIMARY KEY ("roleId", "permissionId"),
  CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "users" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "position" TEXT NOT NULL,
  "area" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" DATETIME,
  "roleId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "modules" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "areas" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "user_modules" (
  "userId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  PRIMARY KEY ("userId", "moduleId"),
  CONSTRAINT "user_modules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "user_modules_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ticket_categories" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "ticket_types" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ticket_priorities" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "slaHours" INTEGER NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "ticket_status" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE "tickets" (
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

CREATE TABLE "ticket_comments" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ticketId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "internal" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ticket_comments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ticket_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ticket_attachments" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ticketId" TEXT NOT NULL,
  "commentId" TEXT,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "path" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ticket_attachments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ticket_attachments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "ticket_comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "ticket_assignments" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ticketId" TEXT NOT NULL,
  "assigneeId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ticket_assignments_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "ticket_assignments_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "read" BOOLEAN NOT NULL DEFAULT false,
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "sla_rules" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "priorityId" TEXT NOT NULL,
  "hours" INTEGER NOT NULL,
  "warn75" BOOLEAN NOT NULL DEFAULT true,
  "warn90" BOOLEAN NOT NULL DEFAULT true,
  "warn100" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "sla_rules_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "ticket_priorities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "sla_events" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "ticketId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "percent" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sla_events_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT,
  "ip" TEXT,
  "action" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "email_templates" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "html" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "system_settings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "sessions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "userAgent" TEXT,
  "ip" TEXT,
  "expiresAt" DATETIME NOT NULL,
  "revoked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "modules_name_key" ON "modules"("name");
CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");
CREATE UNIQUE INDEX "ticket_categories_name_key" ON "ticket_categories"("name");
CREATE UNIQUE INDEX "ticket_types_name_key" ON "ticket_types"("name");
CREATE UNIQUE INDEX "ticket_priorities_name_key" ON "ticket_priorities"("name");
CREATE UNIQUE INDEX "ticket_status_name_key" ON "ticket_status"("name");
CREATE UNIQUE INDEX "tickets_number_key" ON "tickets"("number");
CREATE INDEX "tickets_number_idx" ON "tickets"("number");
CREATE INDEX "tickets_typeId_idx" ON "tickets"("typeId");
CREATE INDEX "tickets_statusId_priorityId_idx" ON "tickets"("statusId", "priorityId");
CREATE INDEX "tickets_createdAt_idx" ON "tickets"("createdAt");
CREATE INDEX "audit_logs_module_action_idx" ON "audit_logs"("module", "action");
CREATE UNIQUE INDEX "email_templates_key_key" ON "email_templates"("key");
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

PRAGMA foreign_keys=ON;
