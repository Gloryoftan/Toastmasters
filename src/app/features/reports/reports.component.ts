import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reports">
      <div class="page-header">
        <h1>报告中心</h1>
        <button class="btn-secondary" routerLink="/dashboard">返回首页</button>
      </div>

      <div class="reports-grid">
        <div class="report-card">
          <h3>会员出勤报告</h3>
          <p>生成会员出勤情况的详细报告</p>
          <button class="btn-primary">生成报告</button>
        </div>

        <div class="report-card">
          <h3>角色担任报告</h3>
          <p>查看每位会员担任各种角色的统计</p>
          <button class="btn-primary">生成报告</button>
        </div>

        <div class="report-card">
          <h3>会议活动报告</h3>
          <p>会议举办情况和活动统计报告</p>
          <button class="btn-primary">生成报告</button>
        </div>

        <div class="report-card">
          <h3>成长轨迹报告</h3>
          <p>会员学习进度和成长路径分析</p>
          <button class="btn-primary">生成报告</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports {
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

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .report-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .report-card h3 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .report-card p {
      color: #666;
      margin-bottom: 20px;
    }

    .btn-primary {
      padding: 12px 24px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
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
export class ReportsComponent {}
 