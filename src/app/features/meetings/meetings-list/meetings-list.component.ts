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

      <div class="meetings-table" *ngIf="meetingsView$ | async as meetings">
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

      <div *ngIf="(meetingsView$ | async)?.length === 0" class="empty-state">
        <p>还没有会议记录</p>
      </div>
    </div>
  `,
  styles: [`
    .meetings-list {
      padding: 24px;
      max-width: 1400px;
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

    .type-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      display: inline-block;
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

    .status-badge.draft {
      background: #e2e3e5;
      color: #6c757d;
    }

    .status-badge.in-progress {
      background: #cce5ff;
      color: #0066cc;
    }

    .btn-primary, .btn-small {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
      transition: background-color 0.2s;
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

    .btn-small:hover {
      background: #e0e0e0;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    @media (max-width: 768px) {
      .meetings-table {
        overflow-x: auto;
      }
      
      th, td {
        padding: 8px;
        font-size: 12px;
      }
      
      .venue-name {
        font-size: 12px;
      }
      
      .venue-id {
        font-size: 10px;
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
            visitorCount: meeting.visitors.length
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
 