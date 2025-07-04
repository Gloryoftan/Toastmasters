import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Meeting } from '../../../core/models/meeting.model';

@Component({
  selector: 'app-meetings-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="meetings-list">
      <div class="page-header">
        <h1>会议管理</h1>
        <button class="btn-primary" routerLink="/meetings/new">创建会议</button>
      </div>

      <div class="meetings-table" *ngIf="meetings$ | async as meetings">
        <table>
          <thead>
            <tr>
              <th>会议编号</th>
              <th>日期</th>
              <th>主题</th>
              <th>地点</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let meeting of meetings">
              <td>{{ meeting.meetingNumber }}</td>
              <td>{{ meeting.date | date:'yyyy年MM月dd日' }}</td>
              <td>{{ meeting.theme || '-' }}</td>
              <td>{{ meeting.venue }}</td>
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

      <div *ngIf="(meetings$ | async)?.length === 0" class="empty-state">
        <p>还没有会议记录</p>
        <button class="btn-primary" routerLink="/meetings/new">创建第一个会议</button>
      </div>
    </div>
  `,
  styles: [`
    .meetings-list {
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

    .meetings-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      background: #f5f5f5;
      font-weight: 600;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
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

    .btn-primary, .btn-small {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-small {
      background: #f5f5f5;
      color: #333;
      padding: 6px 12px;
      font-size: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
  `]
})
export class MeetingsListComponent implements OnInit {
  meetings$: Observable<Meeting[]>;

  constructor(private dataService: DataService) {
    this.meetings$ = this.dataService.getMeetings();
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
 