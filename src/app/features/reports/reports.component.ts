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

      <!-- 提示信息 -->
      <div class="notice-banner" *ngIf="showNotice">
        <div class="notice-content">
          <span class="notice-icon">🚀</span>
          <span class="notice-text">{{ noticeMessage }}</span>
          <button class="notice-close" (click)="hideNotice()">&times;</button>
        </div>
      </div>

      <div class="reports-grid">
        <div class="report-card">
          <h3>会员出勤报告</h3>
          <p>生成会员出勤情况的详细报告</p>
          <button class="btn-primary" (click)="showComingSoon('会员出勤报告')">生成报告</button>
        </div>

        <div class="report-card">
          <h3>角色担任报告</h3>
          <p>查看每位会员担任各种角色的统计</p>
          <button class="btn-primary" (click)="showComingSoon('角色担任报告')">生成报告</button>
        </div>

        <div class="report-card">
          <h3>会议活动报告</h3>
          <p>会议举办情况和活动统计报告</p>
          <button class="btn-primary" (click)="showComingSoon('会议活动报告')">生成报告</button>
        </div>

        <div class="report-card">
          <h3>成长轨迹报告</h3>
          <p>会员学习进度和成长路径分析</p>
          <button class="btn-primary" (click)="showComingSoon('成长轨迹报告')">生成报告</button>
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

    .notice-banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 32px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      animation: slideIn 0.5s ease-out;
    }

    .notice-content {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
    }

    .notice-icon {
      font-size: 24px;
      animation: bounce 2s infinite;
    }

    .notice-text {
      flex: 1;
      font-size: 16px;
      font-weight: 500;
    }

    .notice-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .notice-close:hover {
      background: rgba(255, 255, 255, 0.3);
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
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .report-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .report-card h3 {
      margin: 0 0 12px 0;
      color: #333;
    }

    .report-card p {
      color: #666;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .btn-primary {
      padding: 12px 24px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s, transform 0.1s;
      font-weight: 500;
    }

    .btn-primary:hover {
      background: #1565c0;
      transform: translateY(-1px);
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-secondary {
      padding: 12px 24px;
      background: #f5f5f5;
      border: none;
      border-radius: 4px;
      text-decoration: none;
      color: #333;
      transition: background-color 0.2s;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-5px);
      }
      60% {
        transform: translateY(-3px);
      }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .notice-content {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .reports-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent {
  showNotice = false;
  noticeMessage = '';

  showComingSoon(reportType: string) {
    this.noticeMessage = `${reportType}功能正在开发中，敬请期待！🎯`;
    this.showNotice = true;
    
    // 3秒后自动隐藏
    setTimeout(() => {
      this.hideNotice();
    }, 3000);
  }

  hideNotice() {
    this.showNotice = false;
  }
}
 