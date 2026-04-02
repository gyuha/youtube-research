-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AnalysisResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "videoSnapshotId" TEXT,
    "status" TEXT NOT NULL,
    "summary" TEXT,
    "insight1" TEXT,
    "insight2" TEXT,
    "insight3" TEXT,
    "errorMessage" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AnalysisResult_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AnalysisResult_videoSnapshotId_fkey" FOREIGN KEY ("videoSnapshotId") REFERENCES "VideoSnapshot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AnalysisResult" ("channelId", "createdAt", "errorMessage", "id", "insight1", "insight2", "insight3", "processedAt", "status", "summary", "updatedAt", "videoSnapshotId") SELECT "channelId", "createdAt", "errorMessage", "id", "insight1", "insight2", "insight3", "processedAt", "status", "summary", "updatedAt", "videoSnapshotId" FROM "AnalysisResult";
DROP TABLE "AnalysisResult";
ALTER TABLE "new_AnalysisResult" RENAME TO "AnalysisResult";
CREATE UNIQUE INDEX "AnalysisResult_channelId_key" ON "AnalysisResult"("channelId");
CREATE UNIQUE INDEX "AnalysisResult_videoSnapshotId_key" ON "AnalysisResult"("videoSnapshotId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
