import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { Member } from '../../core/models/member.model';
import { Meeting } from '../../core/models/meeting.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <header class="dashboard-header">
        <h1>南京ET俱乐部管理系统</h1>
        <p>Nanjing Student Elite Toastmasters Club</p>
      </header>

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
          <div class="meeting-list" *ngIf="meetings$ | async as meetings">
            <div class="meeting-item" *ngFor="let meeting of meetings.slice(-5).reverse()">
              <div class="meeting-info">
                <h4>{{ meeting.theme || '第' + meeting.meetingNumber + '次会议' }}</h4>
                <p>{{ meeting.date | date:'yyyy年MM月dd日' }} - {{ meeting.venue }}</p>
                <span class="meeting-status" [class]="meeting.status">{{ getStatusText(meeting.status) }}</span>
              </div>
              <button class="btn-secondary" [routerLink]="['/meetings', meeting.id]">查看详情</button>
            </div>
          </div>
          <div *ngIf="(meetings$ | async)?.length === 0" class="empty-state">
            <p>还没有会议记录</p>
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

    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
      }
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
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #eee;
    }

    .meeting-item:last-child {
      border-bottom: none;
    }

    .meeting-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
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

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      font-weight: 500;
      transition: background-color 0.2s;
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
    }

    .btn-secondary:hover {
      background: #eeeeee;
    }

    .empty-state {
      text-align: center;
      color: #666;
      padding: 40px 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  members$: Observable<Member[]>;
  meetings$: Observable<Meeting[]>;
  activeMembers$: Observable<number>;
  completedMeetings$: Observable<number>;
  scheduledMeetings$: Observable<number>;

  constructor(private dataService: DataService) {
    this.members$ = this.dataService.getMembers();
    this.meetings$ = this.dataService.getMeetings();
    
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
      'scheduled': '已安排',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  }
} 