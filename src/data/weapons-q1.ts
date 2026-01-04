// Q1 Weapons metadata from PROMPTS_Q1.json
export interface WeaponMetadata {
  artifact_metadata: {
    id: string;
    week: number;
    quarter: number;
    name: string;
    category: string;
    rarity: string;
    palette: string;
    shuffle_pool: string;
  };
}

export const weaponsQ1: WeaponMetadata[] = [
  {
    artifact_metadata: {
      id: "artifact_001",
      week: 1,
      quarter: 1,
      name: "The Iron Wayfarer",
      category: "Sword",
      rarity: "Common",
      palette: "Grounded",
      shuffle_pool: "q1_common"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_002",
      week: 2,
      quarter: 1,
      name: "The River Guide",
      category: "Staff",
      rarity: "Common",
      palette: "Soft",
      shuffle_pool: "q1_common"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_003",
      week: 3,
      quarter: 1,
      name: "The Wind's Reach",
      category: "Bow",
      rarity: "Uncommon",
      palette: "Grounded",
      shuffle_pool: "q1_uncommon"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_004",
      week: 4,
      quarter: 1,
      name: "The Sun Ward",
      category: "Polearm",
      rarity: "Rare",
      palette: "Epic",
      shuffle_pool: "q1_rare"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_005",
      week: 5,
      quarter: 1,
      name: "The Forest Path",
      category: "Sword",
      rarity: "Common",
      palette: "Soft",
      shuffle_pool: "q1_common"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_006",
      week: 6,
      quarter: 1,
      name: "The Night Watch",
      category: "Staff",
      rarity: "Common",
      palette: "Grounded",
      shuffle_pool: "q1_common"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_007",
      week: 7,
      quarter: 1,
      name: "The Sky Beam",
      category: "Bow",
      rarity: "Uncommon",
      palette: "Soft",
      shuffle_pool: "q1_uncommon"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_008",
      week: 8,
      quarter: 1,
      name: "The Stone Heart",
      category: "Polearm",
      rarity: "Rare",
      palette: "Epic",
      shuffle_pool: "q1_rare"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_009",
      week: 9,
      quarter: 1,
      name: "The Silver Silence",
      category: "Sword",
      rarity: "Common",
      palette: "Grounded",
      shuffle_pool: "q1_common"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_010",
      week: 10,
      quarter: 1,
      name: "The Star Map",
      category: "Staff",
      rarity: "Common",
      palette: "Soft",
      shuffle_pool: "q1_common"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_011",
      week: 11,
      quarter: 1,
      name: "The Tiding Arc",
      category: "Bow",
      rarity: "Uncommon",
      palette: "Grounded",
      shuffle_pool: "q1_uncommon"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_012",
      week: 12,
      quarter: 1,
      name: "The Eclipse Core",
      category: "Polearm",
      rarity: "Rare",
      palette: "Epic",
      shuffle_pool: "q1_rare"
    }
  },
  {
    artifact_metadata: {
      id: "artifact_013",
      week: 13,
      quarter: 1,
      name: "The Infinite Edge",
      category: "Ace",
      rarity: "Ace",
      palette: "Masterpiece",
      shuffle_pool: "q1_ace"
    }
  }
];


