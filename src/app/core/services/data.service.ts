import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { Member, CreateMemberRequest } from '../models/member.model';
import { Meeting, MeetingRoleAssignment, MeetingWithAssignments } from '../models/meeting.model';
import { Role, DEFAULT_ROLES } from '../models/role.model';
import { AttendanceStats, MemberGrowthStats } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_KEYS = {
    MEMBERS: 'nanjing-et-club-members',
    MEETINGS: 'nanjing-et-club-meetings',
    ASSIGNMENTS: 'nanjing-et-club-assignments',
    ROLES: 'nanjing-et-club-roles'
  };

  private membersSubject = new BehaviorSubject<Member[]>([]);
  private meetingsSubject = new BehaviorSubject<Meeting[]>([]);
  private assignmentsSubject = new BehaviorSubject<MeetingRoleAssignment[]>([]);
  private rolesSubject = new BehaviorSubject<Role[]>(DEFAULT_ROLES);

  public members$ = this.membersSubject.asObservable();
  public meetings$ = this.meetingsSubject.asObservable();
  public assignments$ = this.assignmentsSubject.asObservable();
  public roles$ = this.rolesSubject.asObservable();

  constructor() {
    this.loadDataFromStorage();
    this.setupAutoSave();
  }

  private loadDataFromStorage() {
    // 从localStorage加载数据，如果没有则使用初始数据
    const members = this.loadFromStorage<Member[]>(this.STORAGE_KEYS.MEMBERS, this.getInitialMembers());
    const meetings = this.loadFromStorage<Meeting[]>(this.STORAGE_KEYS.MEETINGS, this.getInitialMeetings());
    const assignments = this.loadFromStorage<MeetingRoleAssignment[]>(this.STORAGE_KEYS.ASSIGNMENTS, []);
    const roles = this.loadFromStorage<Role[]>(this.STORAGE_KEYS.ROLES, DEFAULT_ROLES);

    // 处理日期反序列化
    const processedMembers = members.map(member => ({
      ...member,
      joinDate: new Date(member.joinDate)
    }));

    const processedMeetings = meetings.map(meeting => ({
      ...meeting,
      date: new Date(meeting.date)
    }));

    this.membersSubject.next(processedMembers);
    this.meetingsSubject.next(processedMeetings);
    this.assignmentsSubject.next(assignments);
    this.rolesSubject.next(roles);
  }

  private setupAutoSave() {
    // 自动保存数据到localStorage
    this.members$.subscribe(members => {
      this.saveToStorage(this.STORAGE_KEYS.MEMBERS, members);
    });

    this.meetings$.subscribe(meetings => {
      this.saveToStorage(this.STORAGE_KEYS.MEETINGS, meetings);
    });

    this.assignments$.subscribe(assignments => {
      this.saveToStorage(this.STORAGE_KEYS.ASSIGNMENTS, assignments);
    });

    this.roles$.subscribe(roles => {
      this.saveToStorage(this.STORAGE_KEYS.ROLES, roles);
    });
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  private saveToStorage(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }

  private getInitialMembers(): Member[] {
    return [
      {
        id: 'member-1',
        name: '张三',
        toastmastersId: 'TM001',
        isGuest: false,
        joinDate: new Date('2023-01-15'),
        email: 'zhangsan@example.com',
        status: 'active',
        pathwaysTrack: 'Dynamic Leadership',
        ccManualLevel: 5
      },
      {
        id: 'member-2',
        name: '李四',
        toastmastersId: 'TM002',
        isGuest: false,
        joinDate: new Date('2023-03-20'),
        email: 'lisi@example.com',
        status: 'active',
        pathwaysTrack: 'Presentation Mastery'
      },
      {
        id: 'guest-1',
        name: '王五',
        isGuest: true,
        joinDate: new Date(),
        status: 'active'
      }
    ];
  }

  private getInitialMeetings(): Meeting[] {
    return [
      {
        id: 'meeting-1',
        date: new Date('2024-01-15'),
        meetingNumber: 1001,
        theme: '新年新开始',
        venue: '会议室A',
        type: 'regular',
        status: 'completed'
      },
      {
        id: 'meeting-2',
        date: new Date('2024-01-29'),
        meetingNumber: 1002,
        theme: '沟通的艺术',
        venue: '会议室A',
        type: 'regular',
        status: 'completed'
      }
    ];
  }

  // 会员管理
  getMembers(): Observable<Member[]> {
    return this.members$;
  }

  getMemberById(id: string): Observable<Member | undefined> {
    return this.members$.pipe(
      map(members => members.find(m => m.id === id))
    );
  }

  addMember(memberData: CreateMemberRequest): Observable<Member> {
    const newMember: Member = {
      id: this.generateId('member'),
      ...memberData,
      joinDate: new Date(),
      status: 'active'
    };

    const currentMembers = this.membersSubject.value;
    this.membersSubject.next([...currentMembers, newMember]);
    
    return new BehaviorSubject(newMember).asObservable();
  }

  updateMember(id: string, updates: Partial<Member>): Observable<Member> {
    const currentMembers = this.membersSubject.value;
    const memberIndex = currentMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
      throw new Error('会员不存在');
    }

    const updatedMember = { ...currentMembers[memberIndex], ...updates };
    currentMembers[memberIndex] = updatedMember;
    
    this.membersSubject.next([...currentMembers]);
    return new BehaviorSubject(updatedMember).asObservable();
  }

  // 会议管理
  getMeetings(): Observable<Meeting[]> {
    return this.meetings$;
  }

  getMeetingById(id: string): Observable<Meeting | undefined> {
    return this.meetings$.pipe(
      map(meetings => meetings.find(m => m.id === id))
    );
  }

  addMeeting(meeting: Omit<Meeting, 'id'>): Observable<Meeting> {
    const newMeeting: Meeting = {
      id: this.generateId('meeting'),
      ...meeting
    };

    const currentMeetings = this.meetingsSubject.value;
    this.meetingsSubject.next([...currentMeetings, newMeeting]);
    
    return new BehaviorSubject(newMeeting).asObservable();
  }

  // 角色分配管理
  assignRole(assignment: Omit<MeetingRoleAssignment, 'id'>): Observable<MeetingRoleAssignment> {
    const newAssignment: MeetingRoleAssignment = {
      id: this.generateId('assignment'),
      ...assignment
    };

    const currentAssignments = this.assignmentsSubject.value;
    this.assignmentsSubject.next([...currentAssignments, newAssignment]);
    
    return new BehaviorSubject(newAssignment).asObservable();
  }

  // 统计分析
  getAttendanceStats(): Observable<AttendanceStats[]> {
    return combineLatest([
      this.members$,
      this.meetings$,
      this.assignments$
    ]).pipe(
      map(([members, meetings, assignments]) => {
        return members.map(member => {
          const memberAssignments = assignments.filter(a => a.memberId === member.id);
          const attendedMeetings = memberAssignments.filter(a => a.attended).length;
          const speakingRoles = memberAssignments.filter(a => 
            this.rolesSubject.value.find(r => r.id === a.roleId)?.category === 'speaking'
          ).length;
          const evaluationRoles = memberAssignments.filter(a => 
            this.rolesSubject.value.find(r => r.id === a.roleId)?.category === 'evaluation'
          ).length;
          const leadershipRoles = memberAssignments.filter(a => 
            this.rolesSubject.value.find(r => r.id === a.roleId)?.category === 'leadership'
          ).length;
          const functionalRoles = memberAssignments.filter(a => 
            this.rolesSubject.value.find(r => r.id === a.roleId)?.category === 'functional'
          ).length;

          return {
            memberId: member.id,
            memberName: member.name,
            totalMeetings: meetings.filter(m => m.status === 'completed').length,
            attendedMeetings,
            attendanceRate: attendedMeetings / Math.max(1, meetings.filter(m => m.status === 'completed').length),
            speakingRoles,
            evaluationRoles,
            leadershipRoles,
            functionalRoles
          };
        });
      })
    );
  }

  // 数据导入导出功能
  exportData(): string {
    const data = {
      members: this.membersSubject.value,
      meetings: this.meetingsSubject.value,
      assignments: this.assignmentsSubject.value,
      roles: this.rolesSubject.value,
      exportDate: new Date()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.members) {
        const processedMembers = data.members.map((member: any) => ({
          ...member,
          joinDate: new Date(member.joinDate)
        }));
        this.membersSubject.next(processedMembers);
      }
      
      if (data.meetings) {
        const processedMeetings = data.meetings.map((meeting: any) => ({
          ...meeting,
          date: new Date(meeting.date)
        }));
        this.meetingsSubject.next(processedMeetings);
      }
      
      if (data.assignments) {
        this.assignmentsSubject.next(data.assignments);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // 清除所有数据
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    this.membersSubject.next(this.getInitialMembers());
    this.meetingsSubject.next(this.getInitialMeetings());
    this.assignmentsSubject.next([]);
    this.rolesSubject.next(DEFAULT_ROLES);
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 