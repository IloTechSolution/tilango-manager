// Definisi liga + 8 klub fiksi Tilango-manager.
// Tier mengontrol band atribut skuad: 1 = kuat, 2 = menengah, 3 = lemah.
// Distribusi: 2 kuat, 4 menengah, 2 lemah -> klasemen bervariasi tapi kompetitif.

import type { Tactics } from '@bleckert/football-simulator';

export type Tier = 1 | 2 | 3;

export interface TeamDef {
  id: string;
  name: string;
  short: string;
  color: string;
  tier: Tier;
  formation: string;
  tactics: Partial<Tactics>;
}

export const LEAGUE_NAME = 'Liga Tilango';
export const LEAGUE_SEED = 'tilango-p1';

export const TEAMS: readonly TeamDef[] = [
  {
    id: 'gdt', name: 'Garuda Timur FC', short: 'GDT', color: '#C62828',
    tier: 1, formation: '4-3-3',
    tactics: { formation: '4-3-3', style: 'possession', mentality: 'attacking', tempo: 72, defensiveLine: 62 },
  },
  {
    id: 'smu', name: 'Selat Malaka United', short: 'SMU', color: '#1565C0',
    tier: 1, formation: '4-2-3-1',
    tactics: { formation: '4-2-3-1', style: 'counter', mentality: 'attacking', tempo: 75, defensiveLine: 60 },
  },
  {
    id: 'brm', name: 'Borneo Rimba FC', short: 'BRM', color: '#2E7D32',
    tier: 2, formation: '4-4-2',
    tactics: { formation: '4-4-2', style: 'balanced', mentality: 'balanced', tempo: 68, press: 55 },
  },
  {
    id: 'pbr', name: 'Pesisir Barat FC', short: 'PBR', color: '#EF6C00',
    tier: 2, formation: '3-5-2',
    tactics: { formation: '3-5-2', style: 'direct', mentality: 'attacking', width: 60, tempo: 70, defensiveLine: 60 },
  },
  {
    id: 'kra', name: 'Krakatau FC', short: 'KRA', color: '#6A1B9A',
    tier: 2, formation: '4-4-2',
    tactics: { formation: '4-4-2', style: 'high_press', mentality: 'attacking', press: 72, defensiveLine: 68, tempo: 74 },
  },
  {
    id: 'kbr', name: 'Komodo Barat FC', short: 'KBR', color: '#00838F',
    tier: 2, formation: '4-3-3',
    tactics: { formation: '4-3-3', style: 'balanced', mentality: 'balanced', width: 55, tempo: 68, defensiveLine: 58 },
  },
  {
    id: 'ndu', name: 'Nusa Dua United', short: 'NDU', color: '#F9A825',
    tier: 3, formation: '5-3-2',
    tactics: { formation: '5-3-2', style: 'low_block', mentality: 'defensive', defensiveLine: 30, compactness: 65 },
  },
  {
    id: 'cen', name: 'Cendrawasih FC', short: 'CEN', color: '#AD1457',
    tier: 3, formation: '4-5-1',
    tactics: { formation: '4-5-1', style: 'counter', mentality: 'defensive', tempo: 70 },
  },
];
