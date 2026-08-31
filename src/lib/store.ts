import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import type {
  Review,
  ReviewAnalysis,
  AggregationStats,
  Insight,
  ResearchReport,
  Recommendation,
  StatusState,
} from './types';

const GENERATED_DIR = path.join(process.cwd(), 'generated');

const FILES = {
  reviews: 'reviews.json',
  analysis: 'analysis.json',
  aggregation: 'aggregation.json',
  insights: 'insights.json',
  researchReport: 'researchReport.json',
  recommendations: 'recommendations.json',
  status: 'status.json',
} as const;

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  const filePath = path.join(GENERATED_DIR, filename);
  if (!existsSync(filePath)) return fallback;
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  await mkdir(GENERATED_DIR, { recursive: true });
  const filePath = path.join(GENERATED_DIR, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Reviews -----------------------------------------------------------

export async function getReviews(): Promise<Review[]> {
  return readJson<Review[]>(FILES.reviews, []);
}

export async function saveReviews(reviews: Review[]): Promise<void> {
  await writeJson(FILES.reviews, reviews);
}

// --- Analysis ------------------------------------------------------------

export async function getAnalyses(): Promise<ReviewAnalysis[]> {
  return readJson<ReviewAnalysis[]>(FILES.analysis, []);
}

export async function saveAnalyses(analyses: ReviewAnalysis[]): Promise<void> {
  await writeJson(FILES.analysis, analyses);
}

export async function appendAnalyses(newAnalyses: ReviewAnalysis[]): Promise<void> {
  const existing = await getAnalyses();
  const byId = new Map(existing.map((a) => [a.reviewId, a]));
  for (const a of newAnalyses) byId.set(a.reviewId, a);
  await saveAnalyses(Array.from(byId.values()));
}

// --- Aggregation -----------------------------------------------------------

export async function getAggregation(): Promise<AggregationStats | null> {
  return readJson<AggregationStats | null>(FILES.aggregation, null);
}

export async function saveAggregation(stats: AggregationStats): Promise<void> {
  await writeJson(FILES.aggregation, stats);
}

// --- Insights -----------------------------------------------------------

export async function getInsights(): Promise<Insight[]> {
  return readJson<Insight[]>(FILES.insights, []);
}

export async function saveInsights(insights: Insight[]): Promise<void> {
  await writeJson(FILES.insights, insights);
}

// --- Research report -----------------------------------------------------------

export async function getResearchReport(): Promise<ResearchReport | null> {
  return readJson<ResearchReport | null>(FILES.researchReport, null);
}

export async function saveResearchReport(report: ResearchReport): Promise<void> {
  await writeJson(FILES.researchReport, report);
}

// --- Recommendations -----------------------------------------------------------

export async function getRecommendations(): Promise<Recommendation[]> {
  return readJson<Recommendation[]>(FILES.recommendations, []);
}

export async function saveRecommendations(recs: Recommendation[]): Promise<void> {
  await writeJson(FILES.recommendations, recs);
}

// --- Status -----------------------------------------------------------

const DEFAULT_STATUS: StatusState = {
  status: 'idle',
  progress: 0,
  message: 'Ready',
  updatedAt: new Date().toISOString(),
};

export async function getStatus(): Promise<StatusState> {
  return readJson<StatusState>(FILES.status, DEFAULT_STATUS);
}

export async function setStatus(
  status: StatusState['status'],
  progress: number,
  message: string
): Promise<void> {
  await writeJson(FILES.status, {
    status,
    progress,
    message,
    updatedAt: new Date().toISOString(),
  } satisfies StatusState);
}
