import { motion } from 'framer-motion';
import type { ElementStatCard as ElementStatCardType } from '../../types';
import StatCell from '../shared/StatCell';
import CropMarks from '../shared/CropMarks';

interface ElementStatCardProps {
  element: ElementStatCardType;
  compact?: boolean;
  index?: number;
}

export default function ElementStatCard({ element, compact, index = 0 }: ElementStatCardProps) {
  const { stats } = element;
  const damageBoxes = Array.from({ length: stats.A }, (_, i) => i);

  const card = (
    <div
      className={`stat-card relative bg-bg-card border border-dark-20 overflow-hidden transition-shadow duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${
        compact ? '' : 'h-full'
      }`}
      style={compact ? { width: '3.5in', maxWidth: '3.5in' } : undefined}
    >
      <CropMarks size={10} />

      {/* Header */}
      <div className="bg-dark flex items-center justify-between px-4 py-2.5">
        <h3 className="text-display-card text-white m-0 leading-tight">
          {element.name}
        </h3>
        <span className="text-meta font-bold bg-accent text-dark px-2 py-0.5">
          C{element.class}
        </span>
      </div>

      {/* Faction + Motive */}
      <div className="px-4 pt-2 pb-1.5 flex items-center justify-between border-b border-dark-20">
        {element.faction && (
          <span className="text-micro text-dark-50">{element.faction}</span>
        )}
        <span className="text-micro text-dark-50">{element.motive_type}</span>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-3 gap-0 mx-3 mt-2">
        <StatCell label="m" value={stats.M} />
        <StatCell label="f" value={stats.F} />
        <StatCell label="d" value={stats.D} />
        <StatCell label="a" value={stats.A} />
        <StatCell label="c" value={stats.C} />
        <div className="stat-cell !items-start !justify-start !p-1.5">
          <span className="stat-cell-label">dmg</span>
          <div className="flex flex-wrap gap-0.5 mt-3.5">
            {damageBoxes.map((i) => (
              <div key={i} className="w-3 h-3 border border-dark-20 bg-bg-primary" />
            ))}
          </div>
        </div>
      </div>

      {/* Abilities */}
      <div className="px-4 py-3 border-t border-dark-20 mt-2 flex-1">
        {element.special_rules.length > 0 && (
          <div className="mb-1.5">
            {element.special_rules.map((rule, i) => (
              <span key={i} className="text-body-sm text-dark">
                {rule}
                {i < element.special_rules.length - 1 && (
                  <span className="text-dark-50 mx-1">/</span>
                )}
              </span>
            ))}
          </div>
        )}
        {element.weapon_upgrades.length > 0 && (
          <div className="mt-1.5">
            {element.weapon_upgrades.map((weapon, i) => (
              <div key={i} className="text-micro text-dark-50">
                [{weapon.name}]
                {weapon.f_bonus !== 0 && (
                  <span className="text-dark ml-1">
                    F{weapon.f_bonus > 0 ? '+' : ''}{weapon.f_bonus}
                  </span>
                )}
                {weapon.notes && <span className="ml-1">{weapon.notes}</span>}
              </div>
            ))}
          </div>
        )}
        {element.performance_upgrades.length > 0 && (
          <div className="mt-1.5">
            {element.performance_upgrades.map((upgrade, i) => (
              <span key={i} className="text-body-sm text-dark-50 italic">
                {upgrade}{i < element.performance_upgrades.length - 1 && ', '}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Page ref */}
      <div className="px-4 pb-2 flex justify-end">
        <span className="text-micro text-dark-50">p.{element.page_ref}</span>
      </div>
    </div>
  );

  if (compact) return card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
    >
      {card}
    </motion.div>
  );
}
