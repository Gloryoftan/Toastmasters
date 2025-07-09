// src/app/core/models/member.model.ts

import { Pathways } from "./project.model";

export type MembershipType =
  | 'member'
  | 'guest'
  | 'visitor'
  | 'other';

export type MembershipStatus = 'active' | 'inactive' | 'pending';

export interface Member {
  id: string;
  englishName: string;
  chineseName: string;
  toastmastersId?: string;
  membershipType: MembershipType;
  status: MembershipStatus;
  joinDate: Date;
  gender: 'male' | 'female';
  pathways?: Pathways[];
  credentials?: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
}