export interface Meeting {
  id: string; // MT0001, MT0002...
  date: Date;
  meetingNumber: number;
  theme?: string;
  venue: string;
  type: 'regular' | 'special' | 'contest' | 'training' | 'joint';
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  assignments: Assignment[]; // 所有角色分配
  speeches: Speech[]; // 备稿演讲
  visitors: Visitor[]; // 访客
  attendees: Attendee[]; // 参会人员（非角色）
  notes?: string;
}

export interface Attendee {
  memberId: string; // 参会人员ID (MB0001, MB0002...)
  notes?: string;
}

export interface Assignment {
  roleId: string; // 角色ID (RL01, RL02...)
  memberId: string; // 会员ID (MB0001, MB0002...)
  notes?: string;
}

export interface Speech {
  memberId: string; // 演讲者ID (MB0001, MB0002...)
  title: string; // 演讲题目
  level: Level; // 演讲级别
  projectId: string; // 项目ID
  evaluatorId?: string; // 评估员ID (MB0003, MB0004...)
  passed?: boolean; // 是否通过
  notes?: string;
}

export interface Visitor {
  memberId: string; // 访客ID (MB0005, MB0006...)
  contactId: string; // 对接人ID (MB0007, MB0008...)
  source?: string; // 渠道来源
  notes?: string;
}

export type Level = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5' | 'Contest';