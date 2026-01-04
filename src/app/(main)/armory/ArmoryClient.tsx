'use client';

import Link from 'next/link';
import { FORGE_FILL } from '@/lib/calendar';

interface Weapon {
  id: string;
  weekNumber: number;
  artifactId: string;
  artifactName: string;
  category: string;
  rarity: string;
  forgeLevel: number | null;
  isFinalized: boolean | null;
  finalForgeLevel: number | null;
  currentImage: string;
  fullImage: string;
}

interface ArmoryClientProps {
  weapons: Weapon[];
}

export function ArmoryClient({ weapons }: ArmoryClientProps) {
  // Create array of 52 weeks, filling in collected weapons
  const weekSlots = Array.from({ length: 52 }, (_, i) => {
    const weekNumber = i + 1;
    const weapon = weapons.find(w => w.weekNumber === weekNumber);
    return { weekNumber, weapon };
  });
  
  return (
    <div style={{ 
      minHeight: '100dvh', 
      background: 'var(--bg-primary)',
      padding: '16px',
      paddingTop: 'max(16px, env(safe-area-inset-top))',
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>The Armory</h1>
        <Link 
          href="/journal"
          style={{ 
            color: 'var(--accent)', 
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          ← Journal
        </Link>
      </div>
      
      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
      }}>
        <div style={{ 
          flex: 1, 
          background: 'var(--bg-card)', 
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>
            {weapons.length}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Weapons
          </div>
        </div>
        <div style={{ 
          flex: 1, 
          background: 'var(--bg-card)', 
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>
            {weapons.filter(w => (w.forgeLevel || 0) === 7).length}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Fully Forged
          </div>
        </div>
      </div>
      
      {/* Grid */}
      <div className="armory-grid">
        {weekSlots.map(({ weekNumber, weapon }) => (
          <div 
            key={weekNumber}
            className={`armory-card ${!weapon ? 'locked' : ''}`}
          >
            {weapon && (
              <>
                <img 
                  src={weapon.currentImage} 
                  alt={weapon.artifactName}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/weapons/placeholder.svg';
                  }}
                />
                <div className="forge-indicator">
                  🔥 {FORGE_FILL[weapon.forgeLevel || 0]}%
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


