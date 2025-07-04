import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { AttendanceStats } from '../../core/models/statistics.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="statistics">
      <div class="page-header">
        <h1>统计分析</h1>
        <button class="btn-secondary" routerLink="/dashboard">返回首页</button>
      </div>

      <div class="stats-section">
        <h2>出勤率统计</h2>
        <div class="stats-table" *ngIf="attendanceStats$ | async as stats">
          <table>
            <thead>
              <tr>
                <th>会员姓名</th>
                <th>总会议数</th>
                <th>参与会议数</th>
                <th>出勤率</th>
                <th>演讲角色</th>
                <th>点评角色</th>
                <th>领导角色</th>
                <th>功能角色</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let stat of stats">
                <td>{{ stat.memberName }}</td>
                <td>{{ stat.totalMeetings }}</td>
                <td>{{ stat.attendedMeetings }}</td>
                <td>{{ (stat.attendanceRate * 100) | number:'1.1-1' }}%</td>
                <td>{{ stat.speakingRoles }}</td>
                <td>{{ stat.evaluationRoles }}</td>
                <td>{{ stat.leadershipRoles }}</td>
                <td>{{ stat.functionalRoles }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statistics {
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

    .stats-section {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 24px;
    }

    .stats-table {
      overflow-x: auto;
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

    .btn-secondary {
      padding: 12px 24px;
      background: #f5f5f5;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      color: #333;
    }
  `]
})
export class StatisticsComponent implements OnInit {
  attendanceStats$: Observable<AttendanceStats[]>;

  constructor(private dataService: DataService) {
    this.attendanceStats$ = this.dataService.getAttendanceStats();
  }

  ngOnInit() {}
}
 