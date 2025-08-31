// src/app/core/models/member.model.ts

import { Pathway } from './project.model';

export type MembershipType =
  | 'member' // 会员
  | 'former_member' // 前会员
  | 'honorary_member' // 荣誉会员
  | 'other_club_member' // 其他俱乐部会员
  | 'visitor' // 访客
  | 'guest' // 嘉宾
  | 'other'; // 其他会员

export const MembershipTypeLabels: Record<MembershipType, string> = {
  member: '活跃会员',
  former_member: '前会员',
  honorary_member: '荣誉会员',
  other_club_member: '其他俱乐部会员',
  visitor: '访客',
  guest: '嘉宾',
  other: '其他'
};

export type MembershipStatus = 'active' | 'inactive';

export interface Member {
  id: string; // 会员唯一标识符
  englishName: string; // 英文姓名
  membershipType: MembershipType; // 会员类型
  additionalMembershipTypes?: MembershipType[]; // 附加身份（可选）
  chineseName?: string; // 中文姓名（可选）
  toastmastersId?: string; // 演讲会会员ID（可选）
  joinDate?: Date; // 加入日期（可选）
  gender?: 'male' | 'female'; // 性别（可选）
  pathwaysIds?: string[]; // Pathways学习路径ID数组（可选）
  credentials?: string; // 头衔/资历（可选）
  email?: string; // 电子邮箱（可选）
  phone?: string; // 电话号码（可选）
  birthDate?: Date; // 出生日期（可选）
  notes?: string; // 备注（可选）
}

export type ActivityStatus = 'active' | 'inactive' | 'occasional';

export interface MemberWithStatus extends Member {
  activityStatus: ActivityStatus; // 动态计算
  attendanceRate: number; // 动态计算
  lastAttendanceDate?: Date; // 动态计算
}
