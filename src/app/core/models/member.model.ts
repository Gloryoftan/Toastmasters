// src/app/core/models/member.model.ts

export type MembershipType =
  | 'member'
  | 'guest'
  | 'visitor'
  | 'other';

export type MembershipStatus = 'active' | 'inactive' | 'pending';

export type PathwaysTrack =
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
  | 'Persuasive Influence'
  | 'none'
  | string;

export interface Member {
  id: string;
  englishName: string;
  chineseName: string;
  toastmastersId?: string;
  membershipType: MembershipType;
  joinDate: Date;
  email?: string;
  phone?: string;
  status: MembershipStatus;
  pathwaysTrack?: PathwaysTrack;
  credentials?: string;
}

export interface CreateMemberRequest {
  englishName: string;
  chineseName: string;
  toastmastersId?: string;
  membershipType: MembershipType;
  email?: string;
  phone?: string;
  pathwaysTrack?: PathwaysTrack;
} 