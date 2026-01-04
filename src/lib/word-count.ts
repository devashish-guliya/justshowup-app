/**
 * Count actual words in text.
 * Handles contractions, hyphens, numbers, and edge cases.
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  
  // Normalize whitespace
  const normalized = text
    .trim()
    .replace(/\s+/g, ' '); // Collapse multiple spaces
  
  if (normalized.length === 0) return 0;
  
  // Split by whitespace and filter valid words
  const words = normalized.split(' ').filter(word => {
    // Remove punctuation from ends
    const cleaned = word.replace(/^[^\w]+|[^\w]+$/g, '');
    // Must have at least one alphanumeric character
    return cleaned.length > 0 && /\w/.test(cleaned);
  });
  
  return words.length;
}

// Examples:
// "Hello world" → 2
// "It's a test" → 3 (contractions count as 1)
// "self-aware robot" → 2 (hyphenated = 1 word)
// "  spaced   out  " → 2
// "123 numbers 456" → 3 (numbers count)


