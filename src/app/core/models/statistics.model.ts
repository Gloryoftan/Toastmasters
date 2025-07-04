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