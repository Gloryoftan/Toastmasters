import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, map, switchMap, tap, of, catchError, startWith } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Meeting, Assignment, Speech, Visitor, Attendee } from '../../../core/models/meeting.model';
import { Member } from '../../../core/models/member.model';
import { Role } from '../../../core/models/role.model';
import { Project } from '../../../core/models/project.model';
import { Venue } from '../../../core/models/venue.model';

interface MeetingDetailView {
  meeting: Meeting;
  assignmentDetails: Array<Assignment & { memberName: string; roleName: string }>;
  speechDetails: Array<Speech & { memberName: string; evaluatorName: string; projectName: string }>;
  visitorDetails: Array<Visitor & { visitorName: string; contactName: string }>;
  attendeeDetails: Array<Attendee & { memberName: string }>;
  venueName: string;
}

@Component({
  selector: 'app-meeting-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- 调试信息 -->
    <div style="background: #f0f0f0; padding: 10px; margin: 10px; border-radius: 5px; font-family: monospace;">
      <p>Debug: meetingDetail$ = {{ (meetingDetail$ | async) | json }}</p>
      <p>Debug: meetingDetail$ === null: {{ (meetingDetail$ | async) === null }}</p>
      <p>Debug: !(meetingDetail$ | async): {{ !(meetingDetail$ | async) }}</p>
      <p>Debug: meetingDetail$ type: {{ typeof (meetingDetail$ | async) }}</p>
    </div>
    
    <ng-container *ngIf="(meetingDetail$ | async) as detail; else loading">
      <div class="meeting-detail">
        <div class="page-header">
          <h1>会议详情</h1>
          <div class="header-actions">
            <button class="btn-primary" [routerLink]="['/meetings', detail.meeting.id, 'edit']">
              编辑会议
            </button>
            <button class="btn-secondary" routerLink="/meetings">返回会议列表</button>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="meeting-info card">
          <h2>基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>会议编号:</label>
              <span>{{ detail.meeting.meetingNumber }}</span>
            </div>
            <div class="info-item">
              <label>日期:</label>
              <span>{{ detail.meeting.date | date:'yyyy年MM月dd日 HH:mm' }}</span>
            </div>
            <div class="info-item">
              <label>主题:</label>
              <span>{{ detail.meeting.theme || '无主题' }}</span>
            </div>
            <div class="info-item">
              <label>地点:</label>
              <span>{{ detail.venueName }}</span>
            </div>
            <div class="info-item">
              <label>类型:</label>
              <span class="meeting-type">{{ getMeetingTypeText(detail.meeting.type) }}</span>
            </div>
            <div class="info-item">
              <label>状态:</label>
              <span class="status-badge" [class]="detail.meeting.status">
                {{ getStatusText(detail.meeting.status) }}
              </span>
            </div>
          </div>
          <div class="notes" *ngIf="detail.meeting.notes">
            <label>备注:</label>
            <p>{{ detail.meeting.notes }}</p>
          </div>
        </div>

        <!-- 角色分配 -->
        <div class="assignments card">
          <h2>角色分配</h2>
          <div class="assignments-list" *ngIf="detail.assignmentDetails.length > 0; else noAssignments">
            <div class="assignment-item" *ngFor="let assignment of detail.assignmentDetails">
              <div class="assignment-role">
                <strong>{{ assignment.roleName }}</strong>
              </div>
              <div class="assignment-member">
                {{ assignment.memberName }}
              </div>
              <div class="assignment-notes" *ngIf="assignment.notes">
                <small>{{ assignment.notes }}</small>
              </div>
            </div>
          </div>
          <ng-template #noAssignments>
            <p class="empty-state">暂无角色分配</p>
          </ng-template>
        </div>

        <!-- 备稿演讲 -->
        <div class="speeches card">
          <h2>备稿演讲</h2>
          <div class="speeches-list" *ngIf="detail.speechDetails.length > 0; else noSpeeches">
            <div class="speech-item" *ngFor="let speech of detail.speechDetails">
              <div class="speech-header">
                <h3>{{ speech.title }}</h3>
                <span class="speech-level">{{ speech.level }}</span>
                <span class="speech-status" [class]="speech.passed === true ? 'passed' : speech.passed === false ? 'failed' : 'pending'">
                  {{ speech.passed === true ? '通过' : speech.passed === false ? '未通过' : '待评估' }}
                </span>
              </div>
              <div class="speech-details">
                <div class="speech-info">
                  <span><strong>演讲者:</strong> {{ speech.memberName }}</span>
                  <span><strong>评估员:</strong> {{ speech.evaluatorName }}</span>
                  <span><strong>项目:</strong> {{ speech.projectName }}</span>
                </div>
                <div class="speech-notes" *ngIf="speech.notes">
                  <strong>备注:</strong> {{ speech.notes }}
                </div>
              </div>
            </div>
          </div>
          <ng-template #noSpeeches>
            <p class="empty-state">暂无备稿演讲</p>
          </ng-template>
        </div>

        <!-- 访客信息 -->
        <div class="visitors card" *ngIf="detail.meeting.visitors && detail.meeting.visitors.length > 0">
          <h2>访客信息</h2>
          <div class="visitors-list">
            <div class="visitor-item" *ngFor="let visitor of detail.visitorDetails">
              <div class="visitor-info">
                <div class="visitor-name">
                  <strong>{{ visitor.visitorName }}</strong>
                </div>
                <div class="contact-info">
                  <span><strong>对接人:</strong> {{ visitor.contactName }}</span>
                </div>
                <div class="visitor-source" *ngIf="visitor.source">
                  <span><strong>来源:</strong> {{ visitor.source }}</span>
                </div>
                <div class="visitor-notes" *ngIf="visitor.notes">
                  <strong>备注:</strong> {{ visitor.notes }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 参会人员 -->
        <div class="attendees card" *ngIf="detail.attendeeDetails && detail.attendeeDetails.length > 0">
          <h2>参会人员</h2>
          <div class="attendees-list">
            <div class="attendee-item" *ngFor="let attendee of detail.attendeeDetails">
              <div class="attendee-info">
                <div class="attendee-name">
                  <strong>{{ attendee.memberName }}</strong>
                </div>
                <div class="attendee-notes" *ngIf="attendee.notes">
                  <strong>备注:</strong> {{ attendee.notes }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <ng-template #loading>
      <div class="loading">
        <p>加载中...</p>
        <p style="font-size: 12px; color: #999;">请检查浏览器控制台获取详细信息</p>
        <button class="btn-secondary" routerLink="/meetings">返回会议列表</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .meeting-detail {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 24px;
      margin-bottom: 24px;
    }

    .card h2 {
      margin: 0 0 20px 0;
      color: #333;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-weight: 600;
      color: #666;
      font-size: 14px;
    }

    .info-item span {
      font-size: 16px;
    }

    .meeting-type {
      padding: 4px 8px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 14px;
      display: inline-block;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      display: inline-block;
    }

    .status-badge.completed {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .status-badge.scheduled {
      background: #fff3cd;
      color: #856404;
    }

    .status-badge.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .status-badge.draft {
      background: #f8f9fa;
      color: #6c757d;
    }

    .notes {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .notes label {
      font-weight: 600;
      color: #666;
      margin-bottom: 8px;
      display: block;
    }

    .notes p {
      margin: 0;
      line-height: 1.6;
    }

    .assignments-list, .speeches-list, .attendees-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .assignment-item, .attendee-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
    }

    .assignment-role {
      font-size: 16px;
      margin-bottom: 8px;
      color: #1976d2;
    }

    .assignment-member {
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }

    .assignment-notes, .attendee-notes {
      color: #666;
      font-style: italic;
    }

    .speech-item {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
    }

    .speech-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .speech-header h3 {
      margin: 0;
      flex: 1;
      min-width: 200px;
    }

    .speech-level {
      padding: 4px 8px;
      background: #e1f5fe;
      color: #0277bd;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .speech-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .speech-status.passed {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .speech-status.failed {
      background: #ffebee;
      color: #c62828;
    }

    .speech-status.pending {
      background: #fff3e0;
      color: #ef6c00;
    }

    .speech-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .speech-info {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .speech-info span {
      font-size: 14px;
    }

    .speech-notes {
      padding-top: 8px;
      border-top: 1px solid #ddd;
      margin-top: 8px;
      font-size: 14px;
      line-height: 1.5;
    }

    .visitors-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .visitor-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #f8f9fa;
    }

    .visitor-info, .attendee-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .visitor-name, .attendee-name {
      font-size: 16px;
      color: #333;
    }

    .contact-info,
    .visitor-source {
      font-size: 14px;
      color: #666;
    }

    .visitor-notes {
      padding-top: 8px;
      border-top: 1px solid #ddd;
      margin-top: 8px;
      font-size: 14px;
      line-height: 1.5;
      color: #555;
    }

    .empty-state {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 40px 20px;
    }

    .btn-primary {
      padding: 12px 24px;
      background: #1976d2;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary:hover {
      background: #1565c0;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: #f5f5f5;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      color: #333;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .error {
      text-align: center;
      padding: 60px 20px;
      color: #dc3545;
    }

    .error p {
      margin-bottom: 20px;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .speech-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .speech-info {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class MeetingDetailComponent implements OnInit {
  meetingDetail$!: Observable<MeetingDetailView | null>;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    console.log('🔧 MeetingDetailComponent constructor called');
    
    this.meetingDetail$ = this.route.params.pipe(
      switchMap(params => {
        const meetingId = params['id'];
        console.log('🎯 Loading meeting with ID:', meetingId);
        
        if (!meetingId) {
          console.warn('❌ No meeting ID provided');
          return of(null);
        }
        
        return combineLatest([
          this.dataService.getMeetingById(meetingId),
          this.dataService.getMembers(),
          this.dataService.getRoles(),
          this.dataService.getProjects(),
          this.dataService.getVenues()
        ]).pipe(
          map(([meeting, members, roles, projects, venues]): MeetingDetailView | null => {
            console.log('🔄 Processing data for meeting:', meetingId);
            
            if (!meeting) {
              console.warn('❌ Meeting not found:', meetingId);
              return null;
            }

            const assignmentDetails = meeting.assignments.map(assignment => {
              const member = members.find(m => m.id === assignment.memberId);
              const role = roles.find(r => r.id === assignment.roleId);
              return {
                ...assignment,
                memberName: member ? `${member.englishName} (${member.chineseName})` : '未知会员',
                roleName: role ? `${role.englishName} (${role.chineseName})` : '未知角色'
              };
            });

            const speechDetails = meeting.speeches.map(speech => {
              const member = members.find(m => m.id === speech.memberId);
              const evaluator = members.find(m => m.id === speech.evaluatorId);
              const project = projects.find(p => p.id === speech.projectId);
              return {
                ...speech,
                memberName: member ? `${member.englishName} (${member.chineseName})` : '未知会员',
                evaluatorName: evaluator ? `${evaluator.englishName} (${evaluator.chineseName})` : '未知评估员',
                projectName: project ? `${project.englishName} (${project.chineseName})` : speech.projectId
              } as Speech & { memberName: string; evaluatorName: string; projectName: string };
            });

            const visitorDetails = (meeting.visitors || []).map(visitor => {
              const visitorMember = members.find(m => m.id === visitor.memberId);
              const contactMember = members.find(m => m.id === visitor.contactId);
              return {
                ...visitor,
                visitorName: visitorMember ? `${visitorMember.englishName} (${visitorMember.chineseName})` : '未知访客',
                contactName: contactMember ? `${contactMember.englishName} (${contactMember.chineseName})` : '未知对接人'
              } as Visitor & { visitorName: string; contactName: string };
            });

            const attendeeDetails = (meeting.attendees || []).map(attendee => {
              const member = members.find(m => m.id === attendee.memberId);
              return {
                ...attendee,
                memberName: member ? `${member.englishName} (${member.chineseName})` : '未知会员'
              };
            });

            const venue = venues.find(v => v.id === meeting.venue);
            const venueName = venue ? venue.name : meeting.venue;

            return {
              meeting,
              assignmentDetails,
              speechDetails,
              visitorDetails,
              attendeeDetails,
              venueName
            };
          })
        );
      })
    );
  }

  ngOnInit() {
    // 添加一个简单的测试来确保数据服务正常工作
    console.log('MeetingDetailComponent initialized');
    
    // 测试基本数据加载
    this.dataService.getMeetings().subscribe({
      next: (meetings) => {
        console.log('✅ Meetings loaded successfully:', meetings.length, 'meetings');
        console.log('Available meeting IDs:', meetings.map(m => m.id));
      },
      error: (error) => {
        console.error('❌ Failed to load meetings:', error);
      }
    });
    
    this.dataService.getMembers().subscribe({
      next: (members) => {
        console.log('✅ Members loaded successfully:', members.length, 'members');
      },
      error: (error) => {
        console.error('❌ Failed to load members:', error);
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': '草稿',
      'scheduled': '已安排',
      'in-progress': '进行中',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  }

  getMeetingTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'regular': '常规会议',
      'special': '特别会议',
      'contest': '比赛',
      'training': '培训'
    };
    return typeMap[type] || type;
  }
}
