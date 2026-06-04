-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    CONSTRAINT "CaseNote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CaseNote" ("author", "caseId", "content", "id", "timestamp", "type") SELECT "author", "caseId", "content", "id", "timestamp", "type" FROM "CaseNote";
DROP TABLE "CaseNote";
ALTER TABLE "new_CaseNote" RENAME TO "CaseNote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
