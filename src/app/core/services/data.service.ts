import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Member } from '../models/member.model';
import { Meeting, Assignment, Speech } from '../models/meeting.model';
import { Role } from '../models/role.model';
import { Project } from '../models/project.model';
import { Venue } from '../models/venue.model';
import { AttendanceStats } from '../models/statistics.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private membersSubject = new BehaviorSubject<Member[]>([]);
  private meetingsSubject = new BehaviorSubject<Meeting[]>([]);
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  private venuesSubject = new BehaviorSubject<Venue[]>([]);

  public members$ = this.membersSubject.asObservable();
  public meetings$ = this.meetingsSubject.asObservable();
  public roles$ = this.rolesSubject.asObservable();
  public projects$ = this.projectsSubject.asObservable();
  public venues$ = this.venuesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDataFromJson();
  }

  // 从JSON文件加载数据
  private loadDataFromJson() {
    // 加载会员数据
    this.http.get<Member[]>('data/member.json').subscribe({
      next: (members) => {
        const processedMembers = members.map(member => ({
          ...member,
          joinDate: member.joinDate ? new Date(member.joinDate) : undefined
        }));
        this.membersSubject.next(processedMembers);
      },
      error: (error) => {
        console.warn('Failed to load members from JSON:', error);
        this.membersSubject.next([]);
      }
    });

    // 加载会议数据
    this.http.get<Meeting[]>('data/meeting.json').subscribe({
      next: (meetings) => {
        const processedMeetings = meetings.map(meeting => ({
          ...meeting,
          date: new Date(meeting.date)
        }));
        this.meetingsSubject.next(processedMeetings);
      },
      error: (error) => {
        console.warn('Failed to load meetings from JSON:', error);
        this.meetingsSubject.next([]);
      }
    });

    // 加载角色数据
    this.http.get<Role[]>('data/role.json').subscribe({
      next: (roles) => {
        this.rolesSubject.next(roles);
      },
      error: (error) => {
        console.warn('Failed to load roles from JSON:', error);
        this.rolesSubject.next([]);
      }
    });

    // 加载项目数据
    this.http.get<Project[]>('data/project.json').subscribe({
      next: (projects) => {
        this.projectsSubject.next(projects);
      },
      error: (error) => {
        console.warn('Failed to load projects from JSON:', error);
        this.projectsSubject.next([]);
      }
    });

    // 加载场地数据
    this.http.get<Venue[]>('data/venue.json').subscribe({
      next: (venues) => {
        this.venuesSubject.next(venues);
      },
      error: (error) => {
        console.warn('Failed to load venues from JSON:', error);
        this.venuesSubject.next([]);
      }
    });
  }

  // 会员查询方法
  getMembers(): Observable<Member[]> {
    return this.members$;
  }

  getMemberById(id: string): Observable<Member | undefined> {
    return this.members$.pipe(
      map(members => members.find(m => m.id === id))
    );
  }

  // 会议查询方法
  getMeetings(): Observable<Meeting[]> {
    return this.meetings$;
  }

  getMeetingById(id: string): Observable<Meeting | undefined> {
    return this.meetings$.pipe(
      map(meetings => meetings.find(m => m.id === id))
    );
  }

  // 角色查询方法
  getRoles(): Observable<Role[]> {
    return this.roles$;
  }

  getRoleById(id: string): Observable<Role | undefined> {
    return this.roles$.pipe(
      map(roles => roles.find(r => r.id === id))
    );
  }

  // 项目查询方法
  getProjects(): Observable<Project[]> {
    return this.projects$;
  }

  getProjectById(id: string): Observable<Project | undefined> {
    return this.projects$.pipe(
      map(projects => projects.find(p => p.id === id))
    );
  }

  // 场地查询方法
  getVenues(): Observable<Venue[]> {
    return this.venues$;
  }

  getVenueById(id: string): Observable<Venue | undefined> {
    return this.venues$.pipe(
      map(venues => venues.find(v => v.id === id))
    );
  }

  // 统计分析
  getAttendanceStats(): Observable<AttendanceStats[]> {
    return combineLatest([
      this.members$,
      this.meetings$
    ]).pipe(
      map(([members, meetings]) => {
        const completedMeetings = meetings.filter(m => m.status === 'completed');
        
        return members.map(member => {
          // 统计该会员在各个会议中的分配情况
          const memberAssignments = completedMeetings.flatMap(meeting => 
            meeting.assignments.filter(a => a.memberId === member.id)
          );
          
          // 统计该会员的演讲情况
          const memberSpeeches = completedMeetings.flatMap(meeting => 
            meeting.speeches.filter(s => s.memberId === member.id)
          );

          const attendedMeetings = memberAssignments.length + memberSpeeches.length;
          const totalMeetings = completedMeetings.length;

          return {
            memberId: member.id,
            memberName: `${member.englishName} (${member.chineseName})`,
            totalMeetings,
            attendedMeetings,
            attendanceRate: totalMeetings > 0 ? attendedMeetings / totalMeetings : 0,
            speakingRoles: memberSpeeches.length,
            evaluationRoles: 0, // 可以根据需要进一步统计
            leadershipRoles: memberAssignments.length,
            functionalRoles: 0 // 可以根据需要进一步统计
          };
        });
      })
    );
  }

  // 获取会员的演讲历史
  getMemberSpeeches(memberId: string): Observable<Speech[]> {
    return this.meetings$.pipe(
      map(meetings => {
        return meetings.flatMap(meeting => 
          meeting.speeches.filter(speech => speech.memberId === memberId)
        );
      })
    );
  }

  // 获取会员的角色分配历史
  getMemberAssignments(memberId: string): Observable<Assignment[]> {
    return this.meetings$.pipe(
      map(meetings => {
        return meetings.flatMap(meeting => 
          meeting.assignments.filter(assignment => assignment.memberId === memberId)
        );
      })
    );
  }

  // 重新加载数据
  reloadData(): void {
    this.loadDataFromJson();
  }
} 