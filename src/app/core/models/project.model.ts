// 项目接口
export interface Project {
  id: string;          // PJ01, PJ02...
  englishName: string; // 英文名称
  chineseName: string; // 中文名称
}

export type Pathways =
  | 'Dynamic Leadership'
  | 'Presentation Mastery'
  | 'Visionary Communication'
  | 'Motivational Strategies'
  | 'Team Collaboration'
  | 'Strategic Relationships'
  | 'Engaging Humor'
  | 'Effective Coaching'
  | 'Innovative Planning'
  | 'Leadership Development'
  | 'Persuasive Influence';

export interface Pathway {
  id: string;
  englishName: Pathways;
  chineseName: string;
}