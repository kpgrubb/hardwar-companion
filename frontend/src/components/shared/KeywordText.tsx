import { useMemo } from 'react';
import type { KeywordDefinition } from '../../types';
import { buildKeywordRegex, buildKeywordMap, parseKeywords } from '../../utils/keywordParser';
import KeywordTooltip from './KeywordTooltip';
import keywordsData from '../../data/keywords.json';

const keywords = keywordsData as KeywordDefinition[];
const keywordRegex = buildKeywordRegex(keywords);
const keywordMap = buildKeywordMap(keywords);

interface KeywordTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with keyword terms automatically wrapped in interactive tooltips.
 */
export default function KeywordText({ text, className = '' }: KeywordTextProps) {
  const segments = useMemo(
    () => parseKeywords(text, keywordRegex, keywordMap),
    [text]
  );

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === 'keyword' && seg.keyword ? (
          <KeywordTooltip key={i} keyword={seg.keyword}>
            {seg.content}
          </KeywordTooltip>
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </span>
  );
}
