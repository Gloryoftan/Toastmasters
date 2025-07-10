import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, map, combineLatest } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { Member } from '../../core/models/member.model';
import { Meeting } from '../../core/models/meeting.model';
import { Venue } from '../../core/models/venue.model';

interface DashboardMeetingView extends Meeting {
  venueName: string;
  typeText: string;
  assignmentCount: number;
  visitorCount: number;
  speechCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>总会员数</h3>
          <span class="stat-number">{{ (members$ | async)?.length || 0 }}</span>
        </div>
        <div class="stat-card">
          <h3>活跃会员</h3>
          <span class="stat-number">{{ (activeMembers$ | async) || 0 }}</span>
        </div>
        <div class="stat-card">
          <h3>已举行会议</h3>
          <span class="stat-number">{{ (completedMeetings$ | async) || 0 }}</span>
        </div>
        <div class="stat-card">
          <h3>计划会议</h3>
          <span class="stat-number">{{ (scheduledMeetings$ | async) || 0 }}</span>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="recent-meetings">
          <h2>最近会议</h2>
          <div class="meeting-list" *ngIf="recentMeetings$ | async as meetings">
            <div class="meeting-item" *ngFor="let meeting of meetings">
              <div class="meeting-info">
                <div class="meeting-header">
                  <h4>{{ meeting.theme || '第' + meeting.meetingNumber + '次会议' }}</h4>
                  <span class="type-badge" [class]="meeting.type">{{ meeting.typeText }}</span>
                </div>
                <div class="meeting-details">
                  <div class="detail-row">
                    <span class="detail-label">📅</span>
                    <span>{{ meeting.date | date:'yyyy年MM月dd日' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">📍</span>
                    <span class="venue-info">
                      <span class="venue-name">{{ meeting.venueName }}</span>
                      <span class="venue-id">({{ meeting.venue }})</span>
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">👥</span>
                    <span class="counts">
                      角色: {{ meeting.assignmentCount }} | 备稿: {{ meeting.speechCount }} | 访客: {{ meeting.visitorCount }}
                    </span>
                  </div>
                </div>
                <span class="meeting-status" [class]="meeting.status">{{ getStatusText(meeting.status) }}</span>
              </div>
              <button class="btn-secondary" [routerLink]="['/meetings', meeting.id]">查看详情</button>
            </div>
          </div>
          <div *ngIf="(recentMeetings$ | async)?.length === 0" class="empty-state">
            <p>还没有会议记录</p>
          </div>
          <div class="view-all">
            <button class="btn-link" routerLink="/meetings">查看所有会议 →</button>
          </div>
        </div>

        <div class="quick-actions">
          <h2>快速操作</h2>
          <div class="action-buttons">
            <button class="btn-primary" routerLink="/meetings">管理会议</button>
            <button class="btn-secondary" routerLink="/members">管理会员</button>
            <button class="btn-secondary" routerLink="/statistics">查看统计</button>
            <button class="btn-secondary" routerLink="/reports">生成报告</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      color: #1976d2;
      margin-bottom: 8px;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-card h3 {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #1976d2;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }



    .recent-meetings, .quick-actions {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .meeting-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
      gap: 16px;
    }

    .meeting-item:last-child {
      border-bottom: none;
    }

    .meeting-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .meeting-header {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .meeting-header h4 {
      margin: 0;
      color: #333;
      font-size: 16px;
    }

    .meeting-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .detail-label {
      font-size: 16px;
      width: 20px;
    }

    .venue-info {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .venue-name {
      font-weight: 500;
      color: #333;
    }

    .venue-id {
      color: #666;
      font-size: 12px;
    }

    .counts {
      color: #1976d2;
      font-weight: 500;
      font-size: 13px;
    }

    .type-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
    }

    .type-badge.regular {
      background: #e3f2fd;
      color: #1976d2;
    }

    .type-badge.special {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .type-badge.contest {
      background: #fff3e0;
      color: #ef6c00;
    }

    .type-badge.training {
      background: #e8f5e8;
      color: #388e3c;
    }

    .meeting-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
    }

    .meeting-status.completed {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .meeting-status.scheduled {
      background: #fff3cd;
      color: #856404;
    }

    .meeting-status.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .meeting-status.draft {
      background: #e2e3e5;
      color: #6c757d;
    }

    .meeting-status.in-progress {
      background: #cce5ff;
      color: #0066cc;
    }

    .view-all {
      text-align: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .btn-link {
      background: none;
      border: none;
      color: #1976d2;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
      padding: 8px 0;
      transition: color 0.2s;
    }

    .btn-link:hover {
      color: #1565c0;
      text-decoration: underline;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      font-weight: 500;
      transition: background-color 0.2s, transform 0.1s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-primary:hover {
      background: #1565c0;
      transform: translateY(-1px);
    }

    .btn-secondary:hover {
      background: #eeeeee;
      transform: translateY(-1px);
    }

    .empty-state {
      text-align: center;
      color: #666;
      padding: 40px 0;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .btn-primary, .btn-secondary {
        padding: 10px 8px;
        font-size: 13px;
        line-height: 1.2;
      }
    }

    @media (max-width: 576px) {
      .meeting-item {
        flex-direction: column;
        align-items: stretch;
      }

      .meeting-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .detail-row {
        font-size: 13px;
      }

      .btn-secondary {
        align-self: flex-start;
      }

      .action-buttons {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .btn-primary, .btn-secondary {
        padding: 12px 12px;
        font-size: 14px;
        white-space: normal;
        line-height: 1.3;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  members$: Observable<Member[]>;
  meetings$: Observable<Meeting[]>;
  recentMeetings$: Observable<DashboardMeetingView[]>;
  activeMembers$: Observable<number>;
  completedMeetings$: Observable<number>;
  scheduledMeetings$: Observable<number>;

  constructor(private dataService: DataService) {
    this.members$ = this.dataService.getMembers();
    this.meetings$ = this.dataService.getMeetings();
    
    // 最近5次会议的增强视图
    this.recentMeetings$ = combineLatest([
      this.dataService.getMeetings(),
      this.dataService.getVenues()
    ]).pipe(
      map(([meetings, venues]) => {
        return meetings
          .sort((a, b) => b.date.getTime() - a.date.getTime()) // 按日期倒序
          .slice(0, 5) // 取最近5次
          .map(meeting => {
            const venue = venues.find(v => v.id === meeting.venue);
                         return {
               ...meeting,
               venueName: venue ? venue.name : meeting.venue,
               typeText: this.getTypeText(meeting.type),
               assignmentCount: meeting.assignments.length,
               visitorCount: meeting.visitors.length,
               speechCount: meeting.speeches.length
             } as DashboardMeetingView;
          });
      })
    );
    
    this.activeMembers$ = this.members$.pipe(
      map(members => members.filter(m => m.membershipType === 'member').length)
    );
    
    this.completedMeetings$ = this.meetings$.pipe(
      map(meetings => meetings.filter(m => m.status === 'completed').length)
    );
    
    this.scheduledMeetings$ = this.meetings$.pipe(
      map(meetings => meetings.filter(m => m.status === 'scheduled').length)
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

  getTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'regular': '常规会议',
      'special': '特别会议',
      'contest': '比赛会议',
      'training': '培训会议'
    };
    return typeMap[type] || type;
  }
} 