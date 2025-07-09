import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Meeting, Assignment, Speech } from '../../../core/models/meeting.model';
import { Member } from '../../../core/models/member.model';
import { Role } from '../../../core/models/role.model';
import { Project } from '../../../core/models/project.model';

interface MeetingDetailView {
  meeting: Meeting;
  assignmentDetails: Array<Assignment & { memberName: string; roleName: string }>;
  speechDetails: Array<Speech & { memberName: string; evaluatorName: string; projectName: string }>;
}

@Component({
  selector: 'app-meeting-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="meeting-detail" *ngIf="meetingDetail$ | async as detail">
      <div class="page-header">
        <h1>会议详情</h1>
        <button class="btn-secondary" routerLink="/meetings">返回会议列表</button>
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
            <span>{{ detail.meeting.venue }}</span>
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
    </div>

    <div class="loading" *ngIf="!(meetingDetail$ | async)">
      <p>加载中...</p>
    </div>
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

    .assignments-list, .speeches-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .assignment-item {
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

    .assignment-notes {
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

    .empty-state {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 40px 20px;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: #f5f5f5;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      color: #333;
      cursor: pointer;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .loading {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
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
  meetingDetail$: Observable<MeetingDetailView | null>;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    this.meetingDetail$ = this.route.params.pipe(
      switchMap(params => {
        const meetingId = params['id'];
        return combineLatest([
          this.dataService.getMeetingById(meetingId),
          this.dataService.getMembers(),
          this.dataService.getRoles(),
          this.dataService.getProjects()
        ]).pipe(
          map(([meeting, members, roles, projects]) => {
            if (!meeting) return null;

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

            return {
              meeting,
              assignmentDetails,
              speechDetails
            };
          })
        );
      })
    );
  }

  ngOnInit() {}

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