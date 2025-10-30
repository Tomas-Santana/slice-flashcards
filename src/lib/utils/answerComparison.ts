/**
 * Answer Comparison Utility
 * Provides fuzzy string matching for user answers in practice sessions
 * Uses Fuse.js for powerful fuzzy search capabilities
 */

import Fuse from "fuse.js";

export interface AnswerComparisonResult {
  isCorrect: boolean;
  similarity: number; // 0-1 score
  normalizedUserAnswer: string;
  normalizedCorrectAnswer: string;
}

/**
 * Default similarity threshold for considering an answer correct
 */
const DEFAULT_THRESHOLD = 0.85;

/**
 * Normalizes a string for comparison
 * - Converts to lowercase
 * - Trims whitespace
 * - Removes extra spaces
 * - Removes common punctuation (optional)
 */
export function normalizeString(
  str: string,
  removePunctuation: boolean = true
): string {
  let normalized = str.toLowerCase().trim();

  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, " ");

  if (removePunctuation) {
    // Remove common punctuation but keep apostrophes in contractions
    normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡!]/g, "");
  }

  return normalized;
}

/**
 * Calculates Levenshtein distance between two strings
 * Returns the minimum number of edits needed to transform str1 into str2
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create a 2D array to store distances
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculates similarity between two strings as a percentage (0-1)
 * Uses Levenshtein distance for accurate string comparison
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 && str2.length === 0) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  // Convert distance to similarity (0-1 scale)
  const similarity = 1 - distance / maxLength;

  return Math.max(0, similarity);
}

/**
 * Checks if two strings are similar enough to be considered a match
 */
export function areSimilar(
  str1: string,
  str2: string,
  threshold: number = DEFAULT_THRESHOLD
): boolean {
  const similarity = calculateSimilarity(str1, str2);
  return similarity >= threshold;
}

/**
 * Main function to compare user answer with correct answer
 * Returns detailed comparison result
 */
export function compareAnswers(
  userAnswer: string,
  correctAnswer: string,
  threshold: number = DEFAULT_THRESHOLD
): AnswerComparisonResult {
  // Normalize both answers
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);

  // Calculate similarity
  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

  // Determine if correct based on threshold
  const isCorrect = similarity >= threshold;

  return {
    isCorrect,
    similarity,
    normalizedUserAnswer: normalizedUser,
    normalizedCorrectAnswer: normalizedCorrect,
  };
}

/**
 * Checks if user answer contains the correct answer (partial matching)
 * Useful for multi-word answers where order might vary
 */
export function containsAnswer(
  userAnswer: string,
  correctAnswer: string
): boolean {
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);

  return normalizedUser.includes(normalizedCorrect);
}

/**
 * Calculates word-level similarity for multi-word answers
 * Returns the percentage of words that match using Fuse.js
 */
export function wordLevelSimilarity(
  userAnswer: string,
  correctAnswer: string
): number {
  const userWords = normalizeString(userAnswer).split(" ");
  const correctWords = normalizeString(correctAnswer).split(" ");

  if (correctWords.length === 0) return 0;

  // Create a Fuse instance with correct words
  const fuse = new Fuse(correctWords, {
    includeScore: true,
    threshold: 0.3, // More lenient for individual words
    ignoreLocation: true,
  });

  let matchingWords = 0;
  for (const userWord of userWords) {
    const results = fuse.search(userWord);
    if (results.length > 0 && (results[0].score || 0) < 0.3) {
      matchingWords++;
    }
  }

  return matchingWords / correctWords.length;
}

/**
 * Advanced comparison that combines character-level and word-level similarity
 * Provides more lenient matching for complex answers
 */
export function advancedCompareAnswers(
  userAnswer: string,
  correctAnswer: string,
  threshold: number = DEFAULT_THRESHOLD
): AnswerComparisonResult {
  const normalizedUser = normalizeString(userAnswer);
  const normalizedCorrect = normalizeString(correctAnswer);

  // Calculate both character and word similarity
  const charSimilarity = calculateSimilarity(normalizedUser, normalizedCorrect);
  const wordSimilarity = wordLevelSimilarity(userAnswer, correctAnswer);

  // Use weighted average (60% character, 40% word)
  const combinedSimilarity = charSimilarity * 0.6 + wordSimilarity * 0.4;

  const isCorrect = combinedSimilarity >= threshold;

  return {
    isCorrect,
    similarity: combinedSimilarity,
    normalizedUserAnswer: normalizedUser,
    normalizedCorrectAnswer: normalizedCorrect,
  };
}

/**
 * Gets a human-readable feedback message based on similarity score
 */
export function getSimilarityFeedback(similarity: number): string {
  if (similarity >= 0.95) return "Perfect!";
  if (similarity >= 0.85) return "Correct!";
  if (similarity >= 0.7) return "Very close!";
  if (similarity >= 0.5) return "Almost there";
  if (similarity >= 0.3) return "Not quite";
  return "Incorrect";
}

/**
 * Checks for common typos and alternative spellings
 * Returns true if the difference is likely a typo rather than wrong answer
 */
export function isLikelyTypo(
  userAnswer: string,
  correctAnswer: string
): boolean {
  const similarity = calculateSimilarity(
    normalizeString(userAnswer),
    normalizeString(correctAnswer)
  );

  // If similarity is between 0.8 and 0.9, it's likely a typo
  return similarity >= 0.8 && similarity < 0.9;
}
