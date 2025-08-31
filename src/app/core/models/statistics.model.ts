export interface AttendanceStats {
  memberId: string;
  memberName: string;
  totalMeetings: number;
  attendedMeetings: number;
  attendanceRate: number;
  speakingRoles: number;
  evaluationRoles: number;
  leadershipRoles: number;
  functionalRoles: number;
}

export interface RoleStats {
  roleId: string;
  roleName: string;
  timesPerformed: number;
  lastPerformed?: Date;
}

export interface MemberGrowthStats {
  memberId: string;
  memberName: string;
  ccSpeechesCompleted: number;
  acSpeechesCompleted: number;
  pathwaysProjectsCompleted: number;
  rolesPerformed: RoleStats[];
  joinDate: Date;
  totalMeetingsAttended: number;
}

// 8月备稿统计接口
export interface AugustSpeechStats {
  memberId: string;
  memberName: string;
  speechTitle: string;
  projectId: string;
  projectName: string;
  evaluatorId: string;
  evaluatorName: string;
  meetingDate: Date;
  meetingNumber: number;
}

// 8月会员参会统计接口
export interface AugustAttendanceStats {
  memberId: string;
  memberName: string;
  totalAttendance: number; // 总参会次数
  speechCount: number; // 备稿次数
  evaluationCount: number; // 个评次数
  roleCount: number; // 角色数
} 