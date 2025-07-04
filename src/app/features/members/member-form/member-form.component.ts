import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="member-form">
      <h1>添加会员</h1>
      <p>会员表单功能正在开发中...</p>
      <button class="btn-secondary" routerLink="/members">返回会员列表</button>
    </div>
  `,
  styles: [`
    .member-form {
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
export class MemberFormComponent {}