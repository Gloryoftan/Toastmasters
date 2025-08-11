import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, combineLatest, tap, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Member } from '../models/member.model';
import { Meeting, Assignment, Speech } from '../models/meeting.model';
import { Role } from '../models/role.model';
import { Project } from '../models/project.model';
import { Venue } from '../models/venue.model';
import { AttendanceStats } from '../models/statistics.model';
import { Officer, PastOfficer } from '../models/past-officers.model';
import { Officer as OfficerPosition } from '../models/role.model';

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

  // 从API加载数据
  private loadDataFromJson() {
    console.log('🔄 Starting to load data from API...');
    
    // 加载会员数据
    this.http.get<Member[]>('/api/members').subscribe({
      next: (members) => {
        const processedMembers = members.map(member => ({
          ...member,
          joinDate: member.joinDate ? new Date(member.joinDate) : undefined
        }));
        this.membersSubject.next(processedMembers);
        console.log('✅ Members loaded:', processedMembers.length);
      },
      error: (error) => {
        console.error('❌ Failed to load members from API:', error);
        // 如果API失败，尝试从本地文件加载
        this.loadFromLocalFiles();
      }
    });

    // 加载会议数据
    this.http.get<Meeting[]>('/api/meetings').subscribe({
      next: (meetings) => {
        const processedMeetings = meetings.map(meeting => ({
          ...meeting,
          date: new Date(meeting.date)
        }));
        this.meetingsSubject.next(processedMeetings);
        console.log('✅ Meetings loaded:', processedMeetings.length);
      },
      error: (error) => {
        console.error('❌ Failed to load meetings from API:', error);
        // 如果API失败，尝试从本地文件加载
        this.loadFromLocalFiles();
      }
    });

    // 加载角色数据
    this.http.get<Role[]>('/api/roles').subscribe({
      next: (roles) => {
        this.rolesSubject.next(roles);
        console.log('✅ Roles loaded:', roles.length);
      },
      error: (error) => {
        console.error('❌ Failed to load roles from API:', error);
        // 如果API失败，尝试从本地文件加载
        this.loadFromLocalFiles();
      }
    });

    // 加载项目数据
    this.http.get<Project[]>('/api/projects').subscribe({
      next: (projects) => {
        this.projectsSubject.next(projects);
        console.log('✅ Projects loaded:', projects.length);
      },
      error: (error) => {
        console.error('❌ Failed to load projects from API:', error);
        // 如果API失败，尝试从本地文件加载
        this.loadFromLocalFiles();
      }
    });

    // 加载场地数据
    this.http.get<Venue[]>('/api/venues').subscribe({
      next: (venues) => {
        this.venuesSubject.next(venues);
        console.log('✅ Venues loaded:', venues.length);
      },
      error: (error) => {
        console.error('❌ Failed to load venues from API:', error);
        // 如果API失败，尝试从本地文件加载
        this.loadFromLocalFiles();
      }
    });
  }

  // 从本地文件加载数据（作为备用方案）
  private loadFromLocalFiles() {
    console.log('🔄 尝试从本地文件加载数据...');
    
    // 加载会员数据
    this.http.get<Member[]>('data/member.json').subscribe({
      next: (members) => {
        const processedMembers = members.map(member => ({
          ...member,
          joinDate: member.joinDate ? new Date(member.joinDate) : undefined
        }));
        this.membersSubject.next(processedMembers);
        console.log('✅ Members loaded from local files:', processedMembers.length);
      },
      error: (error) => {
        console.error('❌ Failed to load members from local files:', error);
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
        console.log('✅ Meetings loaded from local files:', processedMeetings.length);
      },
      error: (error) => {
        console.error('❌ Failed to load meetings from local files:', error);
        this.meetingsSubject.next([]);
      }
    });

    // 加载角色数据
    this.http.get<Role[]>('data/role.json').subscribe({
      next: (roles) => {
        this.rolesSubject.next(roles);
        console.log('✅ Roles loaded from local files:', roles.length);
      },
      error: (error) => {
        console.error('❌ Failed to load roles from local files:', error);
        this.rolesSubject.next([]);
      }
    });

    // 加载项目数据
    this.http.get<Project[]>('data/project.json').subscribe({
      next: (projects) => {
        this.projectsSubject.next(projects);
        console.log('✅ Projects loaded from local files:', projects.length);
      },
      error: (error) => {
        console.error('❌ Failed to load projects from local files:', error);
        this.venuesSubject.next([]);
      }
    });

    // 加载场地数据
    this.http.get<Venue[]>('data/venue.json').subscribe({
      next: (venues) => {
        this.venuesSubject.next(venues);
        console.log('✅ Venues loaded from local files:', venues.length);
      },
      error: (error) => {
        console.error('❌ Failed to load venues from local files:', error);
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
      map(meetings => {
        console.log('🔍 Searching for meeting with ID:', id);
        console.log('📋 Available meetings:', meetings.map(m => m.id));
        const meeting = meetings.find(m => m.id === id);
        console.log('✅ Found meeting:', meeting ? { id: meeting.id, number: meeting.meetingNumber } : null);
        return meeting;
      }),
      tap(result => {
        if (!result) {
          console.warn(`❌ Meeting with ID ${id} not found in current meetings list`);
        } else {
          console.log(`✅ Meeting ${id} found successfully`);
        }
      })
    );
  }

  // 更新单场会议信息
  updateMeeting(updatedMeeting: Meeting): void {
    const currentMeetings = this.meetingsSubject.getValue();
    const meetingIndex = currentMeetings.findIndex(m => m.id === updatedMeeting.id);

    if (meetingIndex > -1) {
      // 创建一个新的数组，以确保变更检测能够触发
      const newMeetings = [...currentMeetings];
      newMeetings[meetingIndex] = updatedMeeting;
      
      console.log(`🔄 Updating meeting ${updatedMeeting.id}...`);
      this.meetingsSubject.next(newMeetings);
      console.log(`✅ Meeting ${updatedMeeting.id} updated successfully.`);
    } else {
      console.error(`❌ Failed to update: Meeting with ID ${updatedMeeting.id} not found.`);
    }
  }

  // 保存会议到JSON文件
  saveMeeting(meeting: Meeting): Observable<{ message: string; meeting: Meeting }> {
    return this.http.post<{ message: string; meeting: Meeting }>('/api/meetings', meeting).pipe(
      tap(response => {
        console.log('✅ 会议保存成功:', response.message);
        // 更新本地数据
        this.updateMeeting(meeting);
      }),
      catchError(error => {
        console.error('❌ 保存会议失败:', error);
        throw error;
      })
    );
  }

  // 创建新会议
  createMeeting(meeting: Meeting): Observable<{ message: string; meeting: Meeting }> {
    return this.http.post<{ message: string; meeting: Meeting }>('/api/meetings', meeting).pipe(
      tap(response => {
        console.log('✅ 新会议创建成功:', response.message);
        // 添加到本地数据
        const currentMeetings = this.meetingsSubject.getValue();
        this.meetingsSubject.next([...currentMeetings, meeting]);
      }),
      catchError(error => {
        console.error('❌ 创建会议失败:', error);
        throw error;
      })
    );
  }

  // 删除会议
  deleteMeeting(meetingId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/meetings/${meetingId}`).pipe(
      tap(response => {
        console.log('✅ 会议删除成功:', response.message);
        // 从本地数据中移除
        const currentMeetings = this.meetingsSubject.getValue();
        const filteredMeetings = currentMeetings.filter(m => m.id !== meetingId);
        this.meetingsSubject.next(filteredMeetings);
      }),
      catchError(error => {
        console.error('❌ 删除会议失败:', error);
        throw error;
      })
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
          // 只要该会员在某场会议中担任过任意角色或演讲，则计为一次出勤
          const attendedMeetingIds = new Set<string>();
          let speakingRoles = 0;
          let leadershipRoles = 0;
          let evaluationRoles = 0;
          let functionalRoles = 0;
          completedMeetings.forEach(meeting => {
            let attended = false;
            // 演讲
            const speeches = meeting.speeches.filter(s => s.memberId === member.id);
            if (speeches.length > 0) {
              attended = true;
              speakingRoles += speeches.length;
            }
            // 角色
            const assignments = meeting.assignments.filter(a => a.memberId === member.id);
            if (assignments.length > 0) {
              attended = true;
              // 这里可根据角色类型进一步细分
              leadershipRoles += assignments.length;
            }
            if (attended) attendedMeetingIds.add(meeting.id);
          });
          const totalMeetings = completedMeetings.length;
          const attendedMeetings = attendedMeetingIds.size;
          return {
            memberId: member.id,
            memberName: member.englishName,
            totalMeetings,
            attendedMeetings,
            attendanceRate: totalMeetings > 0 ? attendedMeetings / totalMeetings : 0,
            speakingRoles,
            evaluationRoles,
            leadershipRoles,
            functionalRoles
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

  // 获取当前官员（即past-officers.json中term最大那一届的officers）
  getCurrentOfficers(): Observable<Officer[]> {
    return this.http.get<PastOfficer[]>('data/past-officers.json').pipe(
      map((terms) => {
        if (!terms || terms.length === 0) return [];
        // 找到term最大的那一届
        const sorted = [...terms].sort((a, b) => Number(b.term) - Number(a.term));
        return sorted[0]?.officers || [];
      })
    );
  }

  // 获取官员职务（officer.json）
  getOfficerPositions(): Observable<OfficerPosition[]> {
    return this.http.get<OfficerPosition[]>('data/officer.json');
  }

  // 重新加载数据
  reloadData(): void {
    this.loadDataFromJson();
  }
} 