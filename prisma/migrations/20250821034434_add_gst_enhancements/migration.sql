-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issueDate" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "paidDate" DATETIME,
    "subtotal" DECIMAL NOT NULL DEFAULT 0,
    "taxRate" DECIMAL NOT NULL DEFAULT 0.15,
    "taxAmount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL NOT NULL DEFAULT 0,
    "gstInclusive" BOOLEAN NOT NULL DEFAULT true,
    "exemptFromGst" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "termsConditions" TEXT,
    "customerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "invoices_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_invoices" ("createdAt", "customerId", "dueDate", "id", "invoiceNumber", "issueDate", "notes", "paidAmount", "paidDate", "status", "subtotal", "taxAmount", "taxRate", "termsConditions", "total", "updatedAt", "userId") SELECT "createdAt", "customerId", "dueDate", "id", "invoiceNumber", "issueDate", "notes", "paidAmount", "paidDate", "status", "subtotal", "taxAmount", "taxRate", "termsConditions", "total", "updatedAt", "userId" FROM "invoices";
DROP TABLE "invoices";
ALTER TABLE "new_invoices" RENAME TO "invoices";
CREATE UNIQUE INDEX "invoices_invoiceNumber_key" ON "invoices"("invoiceNumber");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscriptionEndsAt" DATETIME,
    "gstRegistered" BOOLEAN NOT NULL DEFAULT false,
    "gstNumber" TEXT,
    "gstReturnFrequency" TEXT NOT NULL DEFAULT 'BI_MONTHLY'
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "subscriptionEndsAt", "subscriptionStatus", "subscriptionTier", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "subscriptionEndsAt", "subscriptionStatus", "subscriptionTier", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
