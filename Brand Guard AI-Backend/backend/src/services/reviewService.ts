import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  ReviewDecision,
  CreateReviewRequest,
  ReviewMetrics,
  ReviewStatus,
} from '../types';

const DATA_FILE_PATH = path.resolve(__dirname, '../data/reviews.json');

let lockPromise = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const nextLock = lockPromise.then(fn, fn);
  lockPromise = nextLock.then(() => {}, () => {});
  return nextLock;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ensures the reviews storage directory and file exist.
 */
async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    const dir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * Reads all review records from persistent JSON storage with retry resilience.
 */
export async function getAllReviews(): Promise<ReviewDecision[]> {
  await ensureDataFile();
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const raw = await fs.readFile(DATA_FILE_PATH, 'utf-8');
      if (!raw || !raw.trim()) {
        return [];
      }
      const reviews: ReviewDecision[] = JSON.parse(raw);
      return Array.isArray(reviews) ? reviews : [];
    } catch (error) {
      if (attempt < 4) {
        await sleep(15 * (attempt + 1));
        continue;
      }
      console.error('Error reading reviews file after retries:', error);
      return [];
    }
  }
  return [];
}

/**
 * Persists review records to reviews.json using atomic temp file replacement.
 */
async function saveAllReviews(reviews: ReviewDecision[]): Promise<void> {
  await ensureDataFile();
  const tmpPath = `${DATA_FILE_PATH}.${randomUUID()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(reviews, null, 2), 'utf-8');

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await fs.rename(tmpPath, DATA_FILE_PATH);
      return;
    } catch (err) {
      if (attempt < 4) {
        await sleep(15 * (attempt + 1));
        continue;
      }
      // Fallback: direct write if rename fails
      await fs.writeFile(DATA_FILE_PATH, JSON.stringify(reviews, null, 2), 'utf-8');
      try {
        await fs.unlink(tmpPath);
      } catch {}
      return;
    }
  }
}

/**
 * Retrieves the review record associated with a specific analysisId.
 */
export async function getReviewByAnalysisId(analysisId: string): Promise<ReviewDecision | null> {
  if (!analysisId || !analysisId.trim()) return null;
  const reviews = await getAllReviews();
  const found = reviews.find((r) => r.analysisId === analysisId.trim());
  return found || null;
}

/**
 * Retrieves reviews with optional filtering by brandId, companyName, or status.
 */
export async function getReviews(filter?: {
  brandId?: string;
  companyName?: string;
  status?: ReviewStatus;
}): Promise<ReviewDecision[]> {
  let reviews = await getAllReviews();

  if (filter?.brandId) {
    const target = filter.brandId.toLowerCase().trim();
    reviews = reviews.filter((r) => r.brandId?.toLowerCase() === target);
  }

  if (filter?.companyName) {
    const target = filter.companyName.toLowerCase().trim();
    reviews = reviews.filter((r) => r.companyName?.toLowerCase() === target);
  }

  if (filter?.status) {
    reviews = reviews.filter((r) => r.status === filter.status);
  }

  // Sort descending by updatedAt
  return reviews.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export interface ReviewOperationResult {
  review: ReviewDecision;
  isNew: boolean;
  isUpdated: boolean;
  conflict?: boolean;
}

/**
 * Creates a new review decision or updates an existing decision for an analysisId.
 * Guarantees that each analysis has at most one current review record.
 */
export async function createOrUpdateReview(
  data: CreateReviewRequest
): Promise<ReviewOperationResult> {
  return withLock(async () => {
    const reviews = await getAllReviews();
    const existingIndex = reviews.findIndex((r) => r.analysisId === data.analysisId.trim());
    const now = new Date().toISOString();

  // Case 1: Existing review record found
  if (existingIndex !== -1) {
    const existing = reviews[existingIndex];

    // Rule 1: Automated pending registration must NOT overwrite an existing final decision
    if (data.status === 'pending') {
      if (existing.status === 'approved' || existing.status === 'rejected') {
        return { review: existing, isNew: false, isUpdated: false };
      }
      return { review: existing, isNew: false, isUpdated: false };
    }

    // Rule 2: If existing is already approved or rejected, prevent accidental overwrite unless allowUpdate is true
    if ((existing.status === 'approved' || existing.status === 'rejected') && !data.allowUpdate) {
      return { review: existing, isNew: false, isUpdated: false, conflict: true };
    }

    // Record audit trail of previous state
    const auditTrail = existing.auditTrail || [];
    auditTrail.push({
      status: existing.status,
      reviewerName: existing.reviewerName,
      reviewerRole: existing.reviewerRole,
      reviewerEmail: existing.reviewerEmail,
      notes: existing.notes,
      rejectionReason: existing.rejectionReason,
      timestamp: existing.updatedAt,
    });

    const updatedReview: ReviewDecision = {
      ...existing,
      status: data.status,
      reviewerName: data.reviewerName?.trim() || existing.reviewerName,
      reviewerRole: data.reviewerRole?.trim() || existing.reviewerRole,
      reviewerEmail: data.reviewerEmail?.trim() || existing.reviewerEmail,
      notes: data.notes?.trim() !== undefined ? data.notes.trim() : existing.notes,
      rejectionReason: data.status === 'rejected' ? data.rejectionReason?.trim() : undefined,
      updatedAt: now,
      auditTrail,
    };

    reviews[existingIndex] = updatedReview;
    await saveAllReviews(reviews);
    return { review: updatedReview, isNew: false, isUpdated: true };
  }

  // Case 2: New review record
  const newReview: ReviewDecision = {
    id: `rev_${randomUUID()}`,
    analysisId: data.analysisId.trim(),
    brandId: data.brandId?.trim(),
    brandName: data.brandName?.trim(),
    companyName: data.companyName?.trim(),
    industry: data.industry?.trim(),
    contentSnippet: data.contentSnippet?.trim(),
    status: data.status,
    reviewerName: data.reviewerName?.trim(),
    reviewerRole: data.reviewerRole?.trim(),
    reviewerEmail: data.reviewerEmail?.trim(),
    notes: data.notes?.trim(),
    rejectionReason: data.status === 'rejected' ? data.rejectionReason?.trim() : undefined,
    createdAt: now,
    updatedAt: now,
    auditTrail: [],
  };

  reviews.push(newReview);
  await saveAllReviews(reviews);
  return { review: newReview, isNew: true, isUpdated: false };
  });
}

/**
 * Computes dashboard review metrics directly from persistent reviews.json storage.
 */
export async function getReviewMetrics(brandId?: string): Promise<ReviewMetrics> {
  const allReviews = await getAllReviews();
  const filtered = brandId
    ? allReviews.filter((r) => r.brandId?.toLowerCase() === brandId.toLowerCase().trim())
    : allReviews;

  const totalAnalysesReviewed = filtered.length;
  const approvedCount = filtered.filter((r) => r.status === 'approved').length;
  const rejectedCount = filtered.filter((r) => r.status === 'rejected').length;
  const pendingCount = filtered.filter((r) => r.status === 'pending').length;

  const finalizedCount = approvedCount + rejectedCount;
  const approvalRate = finalizedCount > 0 ? Math.round((approvedCount / finalizedCount) * 100) : 100;

  const recentDecisions = [...filtered]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return {
    totalAnalysesReviewed,
    approvedCount,
    rejectedCount,
    pendingCount,
    approvalRate,
    recentDecisions,
  };
}
