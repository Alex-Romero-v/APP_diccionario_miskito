import { allowedVerificationStatuses } from "../schemas/common.mjs";

const requiredReviewFields = [
  "object_type",
  "uid",
  "source_page",
  "source_blocks",
  "raw_text",
  "reason",
  "suggested_resolution",
  "blocking",
  "verification_status",
];

export function validateReviewItemShape(review) {
  const errors = [];

  for (const field of requiredReviewFields) {
    if (!(field in (review ?? {}))) {
      errors.push(`${field} is required.`);
    }
  }

  if (!Array.isArray(review?.source_blocks)) errors.push("source_blocks must be an array.");
  if (typeof review?.blocking !== "boolean") errors.push("blocking must be a boolean.");
  if (!allowedVerificationStatuses.has(review?.verification_status)) {
    errors.push("verification_status must be allowed.");
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export function validateReviewState({ needsReview = [], coverageGaps = [] }) {
  const errors = [];

  if (needsReview.some((review) => review.blocking === true)) {
    errors.push("BLOCKING_REVIEW_EXISTS");
  }

  if (coverageGaps.some((review) => review.blocking === true)) {
    errors.push("COVERAGE_GAP");
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
