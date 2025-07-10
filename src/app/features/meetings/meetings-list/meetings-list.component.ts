import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Meeting } from '../../../core/models/meeting.model';
import { Venue } from '../../../core/models/venue.model';

interface MeetingListView extends Meeting {
  venueName: string;
  typeText: string;
  assignmentCount: number;
  visitorCount: number;
  speechCount: number;
}

@Component({
  selector: 'app-meetings-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="meetings-list">
      <div class="page-header">
        <h1>会议管理</h1>
      </div>

      <!-- 桌面端表格视图 -->
      <div class="desktop-view" *ngIf="meetingsView$ | async as meetings">
        <div class="meetings-table">
          <table>
            <thead>
              <tr>
                <th>会议编号</th>
                <th>日期</th>
                <th>主题</th>
                <th>地点</th>
                <th>形式</th>
                <th>角色数</th>
                <th>访客数</th>
                <th>备稿数</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let meeting of meetings" [class.completed]="meeting.status === 'completed'">
                <td>{{ meeting.meetingNumber }}</td>
                <td>{{ meeting.date | date:'yyyy年MM月dd日' }}</td>
                <td>{{ meeting.theme || '-' }}</td>
                <td class="venue-cell">
                  <div class="venue-name">{{ meeting.venueName }}</div>
                  <div class="venue-id">{{ meeting.venue }}</div>
                </td>
                <td>
                  <span class="type-badge" [class]="meeting.type">
                    {{ meeting.typeText }}
                  </span>
                </td>
                <td class="count-cell">{{ meeting.assignmentCount }}</td>
                <td class="count-cell">{{ meeting.visitorCount }}</td>
                <td class="count-cell">{{ meeting.speechCount }}</td>
                <td>
                  <span class="status-badge" [class]="meeting.status">
                    {{ getStatusText(meeting.status) }}
                  </span>
                </td>
                <td>
                  <button class="btn-small" [routerLink]="['/meetings', meeting.id]">查看</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 移动端卡片视图 -->
      <div class="mobile-view" *ngIf="meetingsView$ | async as meetings">
        <div class="meeting-cards">
          <div class="meeting-card" *ngFor="let meeting of meetings" [class.completed]="meeting.status === 'completed'">
            <div class="card-header">
              <div class="meeting-title">
                <h3>第{{ meeting.meetingNumber }}次会议</h3>
                <span class="type-badge" [class]="meeting.type">{{ meeting.typeText }}</span>
              </div>
              <span class="status-badge" [class]="meeting.status">{{ getStatusText(meeting.status) }}</span>
            </div>
            
            <div class="card-content">
              <div class="meeting-info">
                <div class="info-row">
                  <span class="info-label">📅</span>
                  <span class="info-value">{{ meeting.date | date:'yyyy年MM月dd日' }}</span>
                </div>
                
                <div class="info-row" *ngIf="meeting.theme">
                  <span class="info-label">🎯</span>
                  <span class="info-value">{{ meeting.theme }}</span>
                </div>
                
                <div class="info-row">
                  <span class="info-label">📍</span>
                  <div class="venue-info">
                    <span class="venue-name">{{ meeting.venueName }}</span>
                    <span class="venue-id">({{ meeting.venue }})</span>
                  </div>
                </div>
                
                <div class="info-row">
                  <span class="info-label">👥</span>
                  <span class="counts">
                    角色: {{ meeting.assignmentCount }} | 访客: {{ meeting.visitorCount }} | 备稿: {{ meeting.speechCount }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <button class="btn-primary" [routerLink]="['/meetings', meeting.id]">查看详情</button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="(meetingsView$ | async)?.length === 0" class="empty-state">
        <p>还没有会议记录</p>
      </div>
    </div>
  `,
  styles: [`
    .meetings-list {
      padding: 16px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      color: #333;
    }

    /* 桌面端表格样式 */
    .desktop-view {
      display: block;
    }

    .mobile-view {
      display: none;
    }

    .meetings-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 900px;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
    }

    tr.completed {
      background-color: #fafafa;
    }

    .venue-cell {
      min-width: 140px;
    }

    .venue-name {
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }

    .venue-id {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .count-cell {
      text-align: center;
      font-weight: 600;
      color: #1976d2;
    }

    /* 移动端卡片样式 */
    .meeting-cards {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .meeting-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .meeting-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .meeting-card.completed {
      background-color: #fafafa;
      border-left: 4px solid #4caf50;
    }

    .card-header {
      padding: 16px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .meeting-title {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .meeting-title h3 {
      margin: 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }

    .card-content {
      padding: 16px;
    }

    .meeting-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
    }

    .info-label {
      font-size: 18px;
      width: 24px;
      flex-shrink: 0;
    }

    .info-value {
      color: #333;
      font-weight: 500;
    }

    .venue-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .venue-info .venue-name {
      font-weight: 500;
      color: #333;
    }

    .venue-info .venue-id {
      font-size: 12px;
      color: #666;
    }

    .counts {
      color: #1976d2;
      font-weight: 500;
    }

    .card-actions {
      padding: 16px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
    }

    /* 徽章样式 */
    .type-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      display: inline-block;
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

    .status-badge {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
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
      background: #e2e3e5;
      color: #6c757d;
    }

    .status-badge.in-progress {
      background: #cce5ff;
      color: #0066cc;
    }

    /* 按钮样式 */
    .btn-primary, .btn-small {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      display: inline-block;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
      width: 100%;
      text-align: center;
    }

    .btn-primary:hover {
      background: #1565c0;
      transform: translateY(-1px);
    }

    .btn-small {
      background: #f5f5f5;
      color: #333;
      padding: 6px 12px;
      font-size: 12px;
    }

    .btn-small:hover {
      background: #e0e0e0;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    /* 响应式设计 */
    @media (max-width: 1024px) {
      .meetings-list {
        padding: 16px 12px;
      }
    }

    @media (max-width: 768px) {
      .desktop-view {
        display: none;
      }
      
      .mobile-view {
        display: block;
      }

      .meetings-list {
        padding: 12px 8px;
      }

      .page-header {
        margin-bottom: 16px;
      }

      .page-header h1 {
        font-size: 24px;
      }
    }

    @media (max-width: 480px) {
      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .meeting-title {
        width: 100%;
      }

      .meeting-title h3 {
        font-size: 16px;
      }

      .info-row {
        font-size: 13px;
      }

      .info-label {
        font-size: 16px;
        width: 20px;
      }
    }
  `]
})
export class MeetingsListComponent implements OnInit {
  meetingsView$: Observable<MeetingListView[]>;

  constructor(private dataService: DataService) {
    this.meetingsView$ = combineLatest([
      this.dataService.getMeetings(),
      this.dataService.getVenues()
    ]).pipe(
      map(([meetings, venues]) => {
        return meetings.map(meeting => {
          const venue = venues.find(v => v.id === meeting.venue);
          return {
            ...meeting,
            venueName: venue ? venue.name : meeting.venue,
            typeText: this.getTypeText(meeting.type),
            assignmentCount: meeting.assignments.length,
            visitorCount: meeting.visitors.length,
            speechCount: meeting.speeches.length
          } as MeetingListView;
        }).sort((a, b) => b.date.getTime() - a.date.getTime()); // 按日期倒序排序
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
 