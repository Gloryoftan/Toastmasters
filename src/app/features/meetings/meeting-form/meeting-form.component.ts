import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-meeting-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="meeting-form">
      <h1>创建会议</h1>
      <p>会议表单功能正在开发中...</p>
      <button class="btn-secondary" routerLink="/meetings">返回会议列表</button>
    </div>
  `,
  styles: [`
    .meeting-form {
      padding: 24px;
      max-width: 600px;
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
export class MeetingFormComponent {}