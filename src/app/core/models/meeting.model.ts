export interface Meeting {
  id: string;                    // MT0001, MT0002...
  date: Date;
  meetingNumber: number;
  theme?: string;
  venue: string;
  type: 'regular' | 'special' | 'contest' | 'training';
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  assignments: Assignment[];     // 所有角色分配
  speeches: Speech[];            // 备稿演讲
  notes?: string;
}

export interface Assignment {
  roleId: string;                // 角色ID (RL01, RL02...)
  memberId: string;              // 会员ID (MB0001, MB0002...)
  notes?: string;
}

export interface Speech {
  memberId: string;              // 演讲者ID (MB0001, MB0002...)
  title: string;                 // 演讲题目
  level: string;                 // 演讲级别 "CC1", "AC1", "Level 1", "Level 2" 等
  projectId: string;             // 项目ID
  evaluatorId: string;           // 评估员ID (MB0003, MB0004...)
  passed?: boolean;              // 是否通过
  notes?: string;
}