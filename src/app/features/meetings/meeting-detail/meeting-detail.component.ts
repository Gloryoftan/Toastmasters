import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meeting-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="meeting-detail">
      <h1>会议详情</h1>
      <p>会议详情功能正在开发中...</p>
      <button class="btn-secondary" routerLink="/meetings">返回会议列表</button>
    </div>
  `,
  styles: [`
    .meeting-detail {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
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
export class MeetingDetailComponent {}