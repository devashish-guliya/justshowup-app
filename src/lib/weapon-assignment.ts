import { weaponsQ1, type WeaponMetadata } from '@/data/weapons-q1';
import { getQuarterNumber, getWeekInQuarter } from './calendar';

// Map quarters to weapon data (expand as more quarters are added)
const WEAPONS_BY_QUARTER: Record<number, WeaponMetadata[]> = {
  1: weaponsQ1,
  // Future: 2: weaponsQ2, 3: weaponsQ3, 4: weaponsQ4
};

/**
 * Get rarity for a week based on its position in the quarter.
 * Pattern: Common, Common, Uncommon, Rare (repeats), with week 13 being Ace.
 */
function getRarityForWeek(weekInQuarter: number): string {
  if (weekInQuarter === 13) return 'Ace';
  if ([4, 8, 12].includes(weekInQuarter)) return 'Rare';
  if ([3, 7, 11].includes(weekInQuarter)) return 'Uncommon';
  return 'Common';
}

/**
 * Simple hash function for strings.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Deterministically assign a weapon from the correct shuffle pool.
 * Same user + same week = always same weapon (uses seeded randomness).
 */
export function assignWeaponForWeek(
  userId: string,
  weekNumber: number
): WeaponMetadata {
  const quarterNumber = getQuarterNumber(weekNumber);
  const weekInQuarter = getWeekInQuarter(weekNumber);
  const rarity = getRarityForWeek(weekInQuarter);

  // Use Q1 weapons for all quarters until more are added
  const allWeapons = WEAPONS_BY_QUARTER[quarterNumber] || WEAPONS_BY_QUARTER[1];
  const poolName = `q${Math.min(quarterNumber, 1)}_${rarity.toLowerCase()}`;

  // Filter to this shuffle pool
  const pool = allWeapons.filter(w => w.artifact_metadata.shuffle_pool === poolName);

  if (pool.length === 0) {
    // Fallback to first weapon if pool not found
    console.warn(`No weapons in pool: ${poolName}, using fallback`);
    return allWeapons[0];
  }

  // Aces are fixed (Week 13 = always the same Ace)
  if (rarity === 'Ace') {
    return pool[0];
  }

  // Seeded random: same user + week = same result
  const seed = hashString(`${userId}-week${weekNumber}`);
  const index = seed % pool.length;

  return pool[index];
}

/**
 * Get the asset URL for a weapon at a specific forge level.
 * Uses Supabase Storage assets (uploaded via scripts).
 */
export function getWeaponAssetUrl(
  artifactId: string,
  forgeLevel: number,
  type: 'static' | 'animation' = 'static'
): string {
  // Extract number from artifactId (e.g., "artifact_001" -> 1)
  const artNumberStr = artifactId.replace('artifact_', '');
  const artNumber = parseInt(artNumberStr);

  // Calculate quarter (1-13 = Q1, 14-26 = Q2, etc.)
  const quarter = Math.ceil(artNumber / 13);

  // Filename logic:
  // Old: art_001_day1.png
  // New: q1/artifact_001/day1.webp

  let filename = `day${forgeLevel}`;
  if (type === 'animation') {
    filename += '_anim';
  }
  filename += '.webp';

  const storagePath = `q${quarter}/${artifactId}/${filename}`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL missing, falling back to local assets');
    // Fallback to local (won't work for compressed structure, but safe default)
    return `/weapons/art_${artNumberStr}_day${forgeLevel}${type === 'animation' ? '_anim.gif' : '.png'}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/weapons/${storagePath}`;
}

/**
 * Get all display assets for a weapon.
 */
export function getWeaponDisplayAssets(
  artifactId: string,
  forgeLevel: number
): {
  currentImage: string;
  nextAnimation: string | null;
  sketchImage: string;
  fullRevealImage: string;
} {
  return {
    currentImage: getWeaponAssetUrl(artifactId, forgeLevel),
    nextAnimation: forgeLevel < 7
      ? getWeaponAssetUrl(artifactId, forgeLevel + 1, 'animation')
      : null,
    // Day 0 is always static
    sketchImage: getWeaponAssetUrl(artifactId, 0, 'static'),
    // Day 7 is the full reveal
    fullRevealImage: getWeaponAssetUrl(artifactId, 7, 'static'),
  };
}


