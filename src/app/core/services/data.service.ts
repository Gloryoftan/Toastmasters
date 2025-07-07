import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Member, CreateMemberRequest } from '../models/member.model';
import { Meeting, MeetingRoleAssignment, MeetingWithAssignments } from '../models/meeting.model';
import { Role, DEFAULT_ROLES } from '../models/role.model';
import { AttendanceStats, MemberGrowthStats } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private membersSubject = new BehaviorSubject<Member[]>([]);
  private meetingsSubject = new BehaviorSubject<Meeting[]>([]);
  private assignmentsSubject = new BehaviorSubject<MeetingRoleAssignment[]>([]);
  private rolesSubject = new BehaviorSubject<Role[]>(DEFAULT_ROLES);

  public members$ = this.membersSubject.asObservable();
  public meetings$ = this.meetingsSubject.asObservable();
  public assignments$ = this.assignmentsSubject.asObservable();
  public roles$ = this.rolesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDataFromJson();
  }

  // 从JSON文件加载数据
  private loadDataFromJson() {
    // 加载会员数据
    this.http.get<Member[]>('/data/members.json').subscribe({
      next: (members) => {
        const processedMembers = members.map(member => ({
          ...member,
          joinDate: new Date(member.joinDate)
        }));
        this.membersSubject.next(processedMembers);
      },
      error: (error) => {
        console.warn('Failed to load members from JSON:', error);
        this.membersSubject.next(this.getInitialMembers());
      }
    });

    // 加载会议数据
    this.http.get<Meeting[]>('/data/meetings.json').subscribe({
      next: (meetings) => {
        const processedMeetings = meetings.map(meeting => ({
          ...meeting,
          date: new Date(meeting.date)
        }));
        this.meetingsSubject.next(processedMeetings);
      },
      error: (error) => {
        console.warn('Failed to load meetings from JSON:', error);
        this.meetingsSubject.next(this.getInitialMeetings());
      }
    });

    // 初始化其他数据
    this.assignmentsSubject.next([]);
    this.rolesSubject.next(DEFAULT_ROLES);
  }

  // 保留原有的业务逻辑方法
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

  // 数据导出到JSON格式
  exportToJson(): string {
    const data = {
      members: this.membersSubject.value,
      meetings: this.meetingsSubject.value,
      assignments: this.assignmentsSubject.value,
      roles: this.rolesSubject.value,
      exportDate: new Date()
    };
    return JSON.stringify(data, null, 2);
  }

  // 重新加载JSON数据
  reloadData(): void {
    this.loadDataFromJson();
  }

  // 保留原有的fallback方法
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
      }
    ];
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
} 