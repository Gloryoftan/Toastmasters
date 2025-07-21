// ID 类型定义
export type EntityType = 'MEMBER' | 'ROLE' | 'MEETING' | 'OFFICER' | 'PROJECT' | 'PATHWAY' | 'VENUE' | 'PAST_OFFICER';

// ID 格式示例
export const ID_EXAMPLES = {
  MEMBER: 'MB0001',    // MB0001-MB9999
  ROLE: 'RL01',        // RL01-RL99  
  MEETING: 'MT0001',   // MT0001-MT9999
  OFFICER: 'OF01',     // OF01-OF99
  PROJECT: 'PJ01',     // PJ01-PJ99
  PATHWAY: 'PW01',     // PW01-PW99
  VENUE: 'VN01',      // VN01-VN99
  PAST_OFFICER: 'PO01', // PO01-PO99
} as const;

// ID 前缀
export const ID_PREFIXES = {
  MEMBER: 'MB',
  ROLE: 'RL', 
  MEETING: 'MT',
  OFFICER: 'OF',
  PROJECT: 'PJ',
  PATHWAY: 'PW',
  VENUE: 'VN',
  PAST_OFFICER: 'PO',
} as const;