export interface Member {
  id: string;
  name: string;
  toastmastersId?: string; // 可选，有些会员可能还没有
  isGuest: boolean; // 是否为访客
  joinDate: Date;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  pathwaysTrack?: string; // Pathways学习路径
  ccManualLevel?: number; // CC手册级别
  acManualLevel?: number; // AC手册级别
}

export interface CreateMemberRequest {
  name: string;
  toastmastersId?: string;
  isGuest: boolean;
  email?: string;
  phone?: string;
  pathwaysTrack?: string;
} 