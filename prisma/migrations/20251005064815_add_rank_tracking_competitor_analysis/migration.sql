-- CreateTable
CREATE TABLE "rank_tracking_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "targetDomain" TEXT NOT NULL,
    "location" TEXT NOT NULL DEFAULT 'United States',
    "language" TEXT NOT NULL DEFAULT 'en',
    "device" TEXT NOT NULL DEFAULT 'desktop',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rank_tracking_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank_tracking_keywords" (
    "id" TEXT NOT NULL,
    "rankTrackingProjectId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "searchVolume" INTEGER,
    "difficulty" INTEGER,
    "cpc" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rank_tracking_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_rankings" (
    "id" TEXT NOT NULL,
    "rankTrackingKeywordId" TEXT NOT NULL,
    "position" INTEGER,
    "url" TEXT,
    "title" TEXT,
    "description" TEXT,
    "searchEngine" TEXT NOT NULL DEFAULT 'google',
    "device" TEXT NOT NULL DEFAULT 'desktop',
    "location" TEXT NOT NULL DEFAULT 'United States',
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keyword_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ranking_snapshots" (
    "id" TEXT NOT NULL,
    "rankTrackingProjectId" TEXT NOT NULL,
    "totalKeywords" INTEGER NOT NULL,
    "averagePosition" DECIMAL(5,2),
    "keywordsInTop10" INTEGER NOT NULL DEFAULT 0,
    "keywordsInTop50" INTEGER NOT NULL DEFAULT 0,
    "keywordsInTop100" INTEGER NOT NULL DEFAULT 0,
    "visibility" DECIMAL(5,2),
    "estimatedTraffic" INTEGER,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ranking_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_analysis_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "targetDomain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_analysis_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_domains" (
    "id" TEXT NOT NULL,
    "competitorAnalysisProjectId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitor_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitor_analyses" (
    "id" TEXT NOT NULL,
    "competitorAnalysisProjectId" TEXT NOT NULL,
    "targetDomain" TEXT NOT NULL,
    "competitorDomains" JSONB NOT NULL,
    "targetDomainAuthority" INTEGER,
    "targetOrganicTraffic" INTEGER,
    "targetBacklinks" INTEGER,
    "targetReferringDomains" INTEGER,
    "competitorMetrics" JSONB NOT NULL,
    "keywordGaps" JSONB,
    "contentOpportunities" JSONB,
    "backlinkOpportunities" JSONB,
    "strategicRecommendations" JSONB,
    "trafficComparison" JSONB,
    "aiVendor" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL DEFAULT 5,
    "processingTime" INTEGER,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitor_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rank_tracking_keywords_rankTrackingProjectId_keyword_key" ON "rank_tracking_keywords"("rankTrackingProjectId", "keyword");

-- CreateIndex
CREATE UNIQUE INDEX "competitor_domains_competitorAnalysisProjectId_domain_key" ON "competitor_domains"("competitorAnalysisProjectId", "domain");

-- AddForeignKey
ALTER TABLE "rank_tracking_projects" ADD CONSTRAINT "rank_tracking_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_tracking_projects" ADD CONSTRAINT "rank_tracking_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_tracking_keywords" ADD CONSTRAINT "rank_tracking_keywords_rankTrackingProjectId_fkey" FOREIGN KEY ("rankTrackingProjectId") REFERENCES "rank_tracking_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_rankings" ADD CONSTRAINT "keyword_rankings_rankTrackingKeywordId_fkey" FOREIGN KEY ("rankTrackingKeywordId") REFERENCES "rank_tracking_keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ranking_snapshots" ADD CONSTRAINT "ranking_snapshots_rankTrackingProjectId_fkey" FOREIGN KEY ("rankTrackingProjectId") REFERENCES "rank_tracking_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_analysis_projects" ADD CONSTRAINT "competitor_analysis_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_analysis_projects" ADD CONSTRAINT "competitor_analysis_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_domains" ADD CONSTRAINT "competitor_domains_competitorAnalysisProjectId_fkey" FOREIGN KEY ("competitorAnalysisProjectId") REFERENCES "competitor_analysis_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_analyses" ADD CONSTRAINT "competitor_analyses_competitorAnalysisProjectId_fkey" FOREIGN KEY ("competitorAnalysisProjectId") REFERENCES "competitor_analysis_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
