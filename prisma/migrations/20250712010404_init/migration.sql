-- CreateTable
CREATE TABLE "auth_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "auth_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
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
    "subscriptionEndsAt" DATETIME
);

-- CreateTable
CREATE TABLE "business_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL,
    "subType" TEXT,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "business_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT,
    "amount" DECIMAL NOT NULL,
    "debitAccountId" TEXT NOT NULL,
    "creditAccountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "bankTransactionId" TEXT,
    "bankImported" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transactions_debitAccountId_fkey" FOREIGN KEY ("debitAccountId") REFERENCES "business_accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_creditAccountId_fkey" FOREIGN KEY ("creditAccountId") REFERENCES "business_accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_accounts_provider_providerAccountId_key" ON "auth_accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "business_accounts_bankAccountId_key" ON "business_accounts"("bankAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_bankTransactionId_key" ON "transactions"("bankTransactionId");
