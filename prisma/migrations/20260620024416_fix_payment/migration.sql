/*
  Warnings:

  - You are about to drop the `Usage` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `endDate` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `providerId` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Usage";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "eventId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'twd',
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "currency", "endDate", "id", "plan", "provider", "providerId", "status", "userId") SELECT "amount", "createdAt", "currency", "endDate", "id", "plan", "provider", "providerId", "status", "userId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_providerId_key" ON "Payment"("providerId");
CREATE UNIQUE INDEX "Payment_eventId_key" ON "Payment"("eventId");
CREATE INDEX "Payment_userId_endDate_idx" ON "Payment"("userId", "endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
