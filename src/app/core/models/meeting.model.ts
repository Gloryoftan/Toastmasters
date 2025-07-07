export interface Meeting {
  id: string;
  date: Date;
  meetingNumber: number;
  theme?: string;
  venue: string;
  type: 'regular' | 'special' | 'contest';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  assignments?: AssignmentMap;
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

// 角色定义（可单独维护一个 map，便于国际化和前端展示）
export const ROLE_MAP = {
  president: "主席",
  toastmaster: "教育官",
  timer: "计时官",
  ahCounter: "Ah 计官",
  grammarian: "语法官",
  voteCounter: "计票官",
  speaker1: "演讲者1",
  speaker2: "演讲者2",
  evaluator1: "评估1",
  evaluator2: "评估2",
  // ...其他角色
}; 

export type AssignmentMap = {
  [roleId: string]:
    | string // 会员ID
    | {
        memberId: string;
        speech: {
          title: string;
          level: string;
          passed: boolean;
        };
      };
}; 