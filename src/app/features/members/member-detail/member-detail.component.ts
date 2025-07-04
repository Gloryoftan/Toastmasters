import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="member-detail">
      <h1>会员详情</h1>
      <p>会员详情功能正在开发中...</p>
      <button class="btn-secondary" routerLink="/members">返回会员列表</button>
    </div>
  `,
  styles: [`
    .member-detail {
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
export class MemberDetailComponent {}
 