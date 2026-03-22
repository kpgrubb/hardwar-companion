import type { KeywordDefinition } from '../types';

/**
 * Build a regex that matches any keyword term or alias in the dictionary.
 * Longer terms are matched first to prevent partial matches.
 */
export function buildKeywordRegex(keywords: KeywordDefinition[]): RegExp {
  const allTerms: string[] = [];
  for (const kw of keywords) {
    allTerms.push(kw.term);
    for (const alias of kw.aliases) {
      allTerms.push(alias);
    }
  }
  // Sort longest first so "Move & Shoot" matches before "Move"
  allTerms.sort((a, b) => b.length - a.length);
  // Escape special regex chars
  const escaped = allTerms.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

/**
 * Build a lookup map from term/alias (lowercased) to keyword definition.
 */
export function buildKeywordMap(
  keywords: KeywordDefinition[]
): Map<string, KeywordDefinition> {
  const map = new Map<string, KeywordDefinition>();
  for (const kw of keywords) {
    map.set(kw.term.toLowerCase(), kw);
    for (const alias of kw.aliases) {
      map.set(alias.toLowerCase(), kw);
    }
  }
  return map;
}

export interface TextSegment {
  type: 'text' | 'keyword';
  content: string;
  keyword?: KeywordDefinition;
}

/**
 * Parse a text string and split it into segments of plain text and keyword matches.
 */
export function parseKeywords(
  text: string,
  regex: RegExp,
  keywordMap: Map<string, KeywordDefinition>
): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  // Reset regex state
  regex.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const matchedText = match[0];
    const keyword = keywordMap.get(matchedText.toLowerCase());

    if (keyword) {
      segments.push({
        type: 'keyword',
        content: matchedText,
        keyword,
      });
    } else {
      segments.push({
        type: 'text',
        content: matchedText,
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}
