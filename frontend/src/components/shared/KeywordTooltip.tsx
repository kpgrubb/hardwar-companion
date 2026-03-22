import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { KeywordDefinition } from '../../types';
import { useRulesetStore } from '../../stores/rulesetStore';

interface KeywordTooltipProps {
  keyword: KeywordDefinition;
  children: React.ReactNode;
}

export default function KeywordTooltip({ keyword, children }: KeywordTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, flipBelow: false });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const hoverTimeout = useRef<number | null>(null);
  const leaveTimeout = useRef<number | null>(null);
  const ruleset = useRulesetStore((s) => s.ruleset);

  const definition =
    ruleset === 'quickplay' && keyword.definition_quickplay
      ? keyword.definition_quickplay
      : keyword.definition_core;

  const pageRef =
    ruleset === 'quickplay' && keyword.page_ref_quickplay
      ? `Quickplay p.${keyword.page_ref_quickplay}`
      : `Core p.${keyword.page_ref_core}`;

  const variantNote =
    ruleset === 'core' && keyword.definition_quickplay
      ? keyword.definition_quickplay
      : null;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const flipBelow = rect.top < 160;
    setPosition({
      top: flipBelow ? rect.bottom + 6 : rect.top - 6,
      left: Math.min(rect.left, window.innerWidth - 296),
      flipBelow,
    });
  }, []);

  const showTooltip = useCallback(() => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    hoverTimeout.current = window.setTimeout(() => {
      updatePosition();
      setVisible(true);
    }, 200);
  }, [updatePosition]);

  const hideTooltip = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    leaveTimeout.current = window.setTimeout(() => {
      setVisible(false);
    }, 100);
  }, []);

  // Mobile: toggle on tap
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        if (visible) {
          setVisible(false);
        } else {
          updatePosition();
          setVisible(true);
        }
      }
    },
    [visible, updatePosition]
  );

  useEffect(() => {
    return () => {
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        className="underline decoration-dotted decoration-accent/50 underline-offset-2 cursor-help"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onClick={handleClick}
      >
        {children}
      </span>
      {visible &&
        createPortal(
          <div
            className="fixed z-50 max-w-[280px] border-l-4 border-l-accent bg-dark p-3 shadow-lg"
            style={{
              top: position.flipBelow ? position.top : undefined,
              bottom: position.flipBelow
                ? undefined
                : window.innerHeight - position.top,
              left: position.left,
            }}
            onMouseEnter={() => {
              if (leaveTimeout.current) {
                clearTimeout(leaveTimeout.current);
                leaveTimeout.current = null;
              }
            }}
            onMouseLeave={hideTooltip}
          >
            {/* Registration marks on tooltip */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-dark-50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-dark-50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-dark-50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-dark-50" />

            <div className="font-mono text-[8pt] font-bold text-accent tracking-widest uppercase mb-1">
              {keyword.term}
            </div>
            <div className="font-body text-[8pt] text-white leading-relaxed mb-2">
              {definition}
            </div>
            <div className="font-mono text-[7pt] text-dark-50">
              {pageRef}
            </div>
            {variantNote && (
              <div className="font-body text-[7pt] text-dark-50 italic mt-1">
                Quickplay: {variantNote}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
