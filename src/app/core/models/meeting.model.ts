export interface Meeting {
  id: string;
  date: Date;
  meetingNumber: number;
  theme?: string;
  venue: string;
  type: 'regular' | 'special' | 'contest';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface MeetingRoleAssignment {
  id: string;
  meetingId: string;
  memberId: string;
  roleId: string;
  speechTitle?: string; // 演讲题目
  speechLevel?: string; // 演讲级别 (CC1, AC1, Level 1, etc.)
  projectPath?: string; // Pathways项目路径
  manual?: 'CC' | 'AC' | 'Pathways'; // 使用的手册类型
  attended: boolean;
  evaluationReceived?: boolean; // 是否收到点评
  notes?: string;
  objectives?: string[]; // 演讲目标
}

export interface MeetingWithAssignments {
  meeting: Meeting;
  assignments: MeetingRoleAssignment[];
} 