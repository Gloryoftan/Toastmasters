import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, map, switchMap } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Member } from '../../../core/models/member.model';
import { Meeting, Assignment, Speech } from '../../../core/models/meeting.model';
import { Role } from '../../../core/models/role.model';
import { Project } from '../../../core/models/project.model';

interface MemberDetailView {
  member: Member;
  speechHistory: Array<Speech & { 
    meetingInfo: string; 
    evaluatorName: string; 
    projectName: string;
    meetingDate: Date;
  }>;
  assignmentHistory: Array<Assignment & { 
    meetingInfo: string; 
    roleName: string;
    meetingDate: Date;
  }>;
  statistics: {
    totalSpeeches: number;
    passedSpeeches: number;
    totalAssignments: number;
    totalMeetingsAttended: number;
    attendanceRate: number;
  };
}

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="member-detail" *ngIf="memberDetail$ | async as detail">
      <div class="page-header">
        <h1>会员详情</h1>
        <button class="btn-secondary" routerLink="/members">返回会员列表</button>
      </div>

      <!-- 基本信息 -->
      <div class="member-info card">
        <h2>基本信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>英文姓名:</label>
            <span>{{ detail.member.englishName }}</span>
          </div>
          <div class="info-item">
            <label>中文姓名:</label>
            <span>{{ detail.member.chineseName }}</span>
          </div>
          <div class="info-item" *ngIf="detail.member.toastmastersId">
            <label>Toastmasters ID:</label>
            <span>{{ detail.member.toastmastersId }}</span>
          </div>
          <div class="info-item">
            <label>会员类型:</label>
            <span class="membership-type">{{ getMembershipTypeText(detail.member.membershipType) }}</span>
          </div>
          <div class="info-item">
            <label>状态:</label>
            <span class="status-badge" [class]="getMemberStatusClass(detail.member.membershipType)">
              {{ getMemberStatusText(detail.member.membershipType) }}
            </span>
          </div>
          <div class="info-item">
            <label>加入日期:</label>
            <span>{{ detail.member.joinDate | date:'yyyy年MM月dd日' }}</span>
          </div>
          <div class="info-item">
            <label>性别:</label>
            <span>{{ detail.member.gender === 'male' ? '男' : '女' }}</span>
          </div>
          <div class="info-item" *ngIf="detail.member.credentials">
            <label>头衔:</label>
            <span class="credentials">{{ detail.member.credentials }}</span>
          </div>
          <div class="info-item" *ngIf="detail.member.email">
            <label>邮箱:</label>
            <span>{{ detail.member.email }}</span>
          </div>
          <div class="info-item" *ngIf="detail.member.phone">
            <label>电话:</label>
            <span>{{ detail.member.phone }}</span>
          </div>
        </div>
        
        <div class="pathways-section" *ngIf="detail.member.pathways && detail.member.pathways.length > 0">
          <label>Pathways:</label>
          <div class="pathways-list">
            <span class="pathway-badge" *ngFor="let pathway of detail.member.pathways">
              {{ pathway }}
            </span>
          </div>
        </div>
      </div>

      <!-- 统计概览 -->
      <div class="statistics card">
        <h2>统计概览</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ detail.statistics.totalSpeeches }}</div>
            <div class="stat-label">总演讲数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ detail.statistics.passedSpeeches }}</div>
            <div class="stat-label">通过演讲</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ detail.statistics.totalAssignments }}</div>
            <div class="stat-label">角色分配</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ detail.statistics.totalMeetingsAttended }}</div>
            <div class="stat-label">参与会议</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ (detail.statistics.attendanceRate * 100) | number:'1.1-1' }}%</div>
            <div class="stat-label">出勤率</div>
          </div>
        </div>
      </div>

      <!-- 演讲历史 -->
      <div class="speech-history card">
        <h2>演讲历史</h2>
        <div class="history-list" *ngIf="detail.speechHistory.length > 0; else noSpeeches">
          <div class="history-item" *ngFor="let speech of detail.speechHistory">
            <div class="item-header">
              <h3>{{ speech.title }}</h3>
              <span class="item-date">{{ speech.meetingDate | date:'yyyy-MM-dd' }}</span>
              <span class="speech-status" [class]="speech.passed === true ? 'passed' : speech.passed === false ? 'failed' : 'pending'">
                {{ speech.passed === true ? '通过' : speech.passed === false ? '未通过' : '待评估' }}
              </span>
            </div>
            <div class="item-details">
              <span><strong>会议:</strong> {{ speech.meetingInfo }}</span>
              <span><strong>级别:</strong> {{ speech.level }}</span>
              <span><strong>项目:</strong> {{ speech.projectName }}</span>
              <span><strong>评估员:</strong> {{ speech.evaluatorName }}</span>
            </div>
            <div class="item-notes" *ngIf="speech.notes">
              <strong>备注:</strong> {{ speech.notes }}
            </div>
          </div>
        </div>
        <ng-template #noSpeeches>
          <p class="empty-state">暂无演讲记录</p>
        </ng-template>
      </div>

      <!-- 角色分配历史 -->
      <div class="assignment-history card">
        <h2>角色分配历史</h2>
        <div class="history-list" *ngIf="detail.assignmentHistory.length > 0; else noAssignments">
          <div class="history-item" *ngFor="let assignment of detail.assignmentHistory">
            <div class="item-header">
              <h3>{{ assignment.roleName }}</h3>
              <span class="item-date">{{ assignment.meetingDate | date:'yyyy-MM-dd' }}</span>
            </div>
            <div class="item-details">
              <span><strong>会议:</strong> {{ assignment.meetingInfo }}</span>
            </div>
            <div class="item-notes" *ngIf="assignment.notes">
              <strong>备注:</strong> {{ assignment.notes }}
            </div>
          </div>
        </div>
        <ng-template #noAssignments>
          <p class="empty-state">暂无角色分配记录</p>
        </ng-template>
      </div>
    </div>

    <div class="loading" *ngIf="!(memberDetail$ | async)">
      <p>加载中...</p>
    </div>
  `,
  styles: [`
    .member-detail {
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

    .membership-type {
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

    .status-badge.active {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .status-badge.inactive {
      background: #f8d7da;
      color: #721c24;
    }

    .credentials {
      padding: 4px 8px;
      background: #fff3e0;
      color: #ef6c00;
      border-radius: 4px;
      font-size: 14px;
      display: inline-block;
      font-weight: bold;
    }

    .pathways-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .pathways-section label {
      font-weight: 600;
      color: #666;
      margin-bottom: 12px;
      display: block;
    }

    .pathways-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .pathway-badge {
      padding: 6px 12px;
      background: #f3e5f5;
      color: #7b1fa2;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 20px;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .history-item {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .item-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .item-header h3 {
      margin: 0;
      flex: 1;
      min-width: 200px;
    }

    .item-date {
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

    .item-details {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .item-details span {
      font-size: 14px;
    }

    .item-notes {
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

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .item-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .item-details {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class MemberDetailComponent implements OnInit {
  memberDetail$: Observable<MemberDetailView | null>;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    this.memberDetail$ = this.route.params.pipe(
      switchMap(params => {
        const memberId = params['id'];
        return combineLatest([
          this.dataService.getMemberById(memberId),
          this.dataService.getMeetings(),
          this.dataService.getMembers(),
          this.dataService.getRoles(),
          this.dataService.getProjects()
        ]).pipe(
          map(([member, meetings, allMembers, roles, projects]) => {
            if (!member) return null;

            // 获取该会员的演讲历史
            const speechHistory = meetings.flatMap(meeting => 
              meeting.speeches
                .filter(speech => speech.memberId === memberId)
                .map(speech => {
                  const evaluator = allMembers.find(m => m.id === speech.evaluatorId);
                  const project = projects.find(p => p.id === speech.projectId);
                  return {
                    ...speech,
                    meetingInfo: `${meeting.meetingNumber} - ${meeting.theme || '无主题'}`,
                    evaluatorName: evaluator ? `${evaluator.englishName} (${evaluator.chineseName})` : '未知评估员',
                    projectName: project ? `${project.englishName} (${project.chineseName})` : speech.projectId,
                    meetingDate: meeting.date
                  } as Speech & { 
                    meetingInfo: string; 
                    evaluatorName: string; 
                    projectName: string;
                    meetingDate: Date;
                  };
                })
            ).sort((a, b) => b.meetingDate.getTime() - a.meetingDate.getTime());

            // 获取该会员的角色分配历史
            const assignmentHistory = meetings.flatMap(meeting => 
              meeting.assignments
                .filter(assignment => assignment.memberId === memberId)
                .map(assignment => {
                  const role = roles.find(r => r.id === assignment.roleId);
                  return {
                    ...assignment,
                    meetingInfo: `${meeting.meetingNumber} - ${meeting.theme || '无主题'}`,
                    roleName: role ? `${role.englishName} (${role.chineseName})` : '未知角色',
                    meetingDate: meeting.date
                  } as Assignment & { 
                    meetingInfo: string; 
                    roleName: string;
                    meetingDate: Date;
                  };
                })
            ).sort((a, b) => b.meetingDate.getTime() - a.meetingDate.getTime());

            // 计算统计数据
            const completedMeetings = meetings.filter(m => m.status === 'completed');
            const totalSpeeches = speechHistory.length;
            const passedSpeeches = speechHistory.filter(s => s.passed === true).length;
            const totalAssignments = assignmentHistory.length;
            const totalMeetingsAttended = new Set([
              ...speechHistory.map(s => s.meetingInfo),
              ...assignmentHistory.map(a => a.meetingInfo)
            ]).size;
            const attendanceRate = completedMeetings.length > 0 ? totalMeetingsAttended / completedMeetings.length : 0;

            return {
              member,
              speechHistory,
              assignmentHistory,
              statistics: {
                totalSpeeches,
                passedSpeeches,
                totalAssignments,
                totalMeetingsAttended,
                attendanceRate
              }
            };
          })
        );
      })
    );
  }

  ngOnInit() {}

  getMembershipTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'member': '正式会员',
      'guest': '嘉宾',
      'visitor': '访客',
      'other': '其他'
    };
    return typeMap[type] || type;
  }

  getMemberStatusText(membershipType: string): string {
    const statusMap: { [key: string]: string } = {
      'member': '活跃',
      'former_member': '前会员',
      'honorary_member': '荣誉会员',
      'other_club_member': '其他俱乐部会员',
      'visitor': '访客',
      'guest': '嘉宾',
      'other': '其他'
    };
    return statusMap[membershipType] || '未知';
  }

  getMemberStatusClass(membershipType: string): string {
    const classMap: { [key: string]: string } = {
      'member': 'active',
      'former_member': 'inactive',
      'honorary_member': 'active',
      'other_club_member': 'guest',
      'visitor': 'guest',
      'guest': 'guest',
      'other': 'inactive'
    };
    return classMap[membershipType] || 'inactive';
  }
}
 