import type { ElementStatCard as ElementStatCardType } from '../../types';
import StatCell from '../shared/StatCell';

interface ElementStatCardProps {
  element: ElementStatCardType;
  compact?: boolean;
}

export default function ElementStatCard({ element, compact }: ElementStatCardProps) {
  const { stats } = element;
  const damageBoxes = Array.from({ length: stats.A }, (_, i) => i);

  return (
    <div
      className={`stat-card bg-bg-card border border-dark-20 overflow-hidden ${
        compact ? 'text-[7pt]' : ''
      }`}
      style={{ width: compact ? '3.5in' : '100%', maxWidth: '3.5in' }}
    >
      {/* Header — Dark bar with name + class badge */}
      <div className="bg-dark flex items-center justify-between px-3 py-2">
        <h3 className="font-display text-white text-lg font-bold uppercase tracking-wide m-0 leading-tight">
          {element.name}
        </h3>
        <span className="font-mono text-xs font-bold bg-accent text-dark px-2 py-0.5 leading-none">
          C{element.class}
        </span>
      </div>

      {/* Faction + Motive */}
      <div className="px-3 pt-1.5 pb-1 flex items-center justify-between">
        {element.faction && (
          <span className="font-ui text-[7pt] text-dark-50 uppercase tracking-widest">
            {element.faction}
          </span>
        )}
        <span className="font-ui text-[7pt] text-dark-50 uppercase tracking-widest">
          {element.motive_type}
        </span>
      </div>

      {/* Stat Grid — 2x3 */}
      <div className="grid grid-cols-3 gap-0 mx-3">
        <StatCell label="m" value={stats.M} />
        <StatCell label="f" value={stats.F} />
        <StatCell label="d" value={stats.D} />
        <StatCell label="a" value={stats.A} />
        <StatCell label="c" value={stats.C} />
        {/* Damage track in the 6th cell */}
        <div className="stat-cell !items-start !justify-start !p-1">
          <span className="stat-cell-label">dmg</span>
          <div className="flex flex-wrap gap-0.5 mt-3">
            {damageBoxes.map((i) => (
              <div key={i} className="damage-box" />
            ))}
          </div>
        </div>
      </div>

      {/* Special Rules + Weapons */}
      <div className="px-3 py-2 border-t border-dark-20">
        {element.special_rules.length > 0 && (
          <div className="mb-1">
            {element.special_rules.map((rule, i) => (
              <span
                key={i}
                className="font-body text-[8pt] text-dark inline"
              >
                {rule}
                {i < element.special_rules.length - 1 && (
                  <span className="text-dark-50 mx-1">/</span>
                )}
              </span>
            ))}
          </div>
        )}
        {element.weapon_upgrades.length > 0 && (
          <div className="mt-1">
            {element.weapon_upgrades.map((weapon, i) => (
              <div key={i} className="font-mono text-[7pt] text-dark-50">
                [{weapon.name}]{' '}
                {weapon.f_bonus !== 0 && (
                  <span className="text-dark">F{weapon.f_bonus > 0 ? '+' : ''}{weapon.f_bonus}</span>
                )}
                {weapon.notes && <span className="ml-1">{weapon.notes}</span>}
              </div>
            ))}
          </div>
        )}
        {element.performance_upgrades.length > 0 && (
          <div className="mt-1">
            {element.performance_upgrades.map((upgrade, i) => (
              <span
                key={i}
                className="font-body text-[7pt] text-dark-50 italic inline"
              >
                {upgrade}
                {i < element.performance_upgrades.length - 1 && ', '}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Page Reference */}
      <div className="px-3 pb-1.5 flex justify-end">
        <span className="font-mono text-[6pt] text-dark-50">
          p.{element.page_ref}
        </span>
      </div>
    </div>
  );
}
