import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Member } from '../../../core/models/member.model';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="members-list">
      <div class="page-header">
        <h1>会员管理</h1>
        <button class="btn-primary" routerLink="/members/new">添加会员</button>
      </div>

      <div class="members-grid" *ngIf="members$ | async as members">
        <div class="member-card" *ngFor="let member of members">
          <div class="member-info">
            <h3>{{ member.name }}</h3>
            <p *ngIf="member.toastmastersId">ID: {{ member.toastmastersId }}</p>
            <p *ngIf="member.isGuest" class="guest-badge">访客</p>
            <p class="join-date">加入日期: {{ member.joinDate | date:'yyyy年MM月dd日' }}</p>
            <span class="status-badge" [class]="member.status">{{ member.status === 'active' ? '活跃' : '非活跃' }}</span>
          </div>
          <div class="member-actions">
            <button class="btn-secondary" [routerLink]="['/members', member.id]">查看详情</button>
            <button class="btn-secondary" [routerLink]="['/members', member.id, 'edit']">编辑</button>
          </div>
        </div>
      </div>

      <div *ngIf="(members$ | async)?.length === 0" class="empty-state">
        <p>还没有会员记录</p>
        <button class="btn-primary" routerLink="/members/new">添加第一个会员</button>
      </div>
    </div>
  `,
  styles: [`
    .members-list {
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

    .members-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .member-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .member-info h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .member-info p {
      margin: 4px 0;
      color: #666;
      font-size: 14px;
    }

    .guest-badge {
      display: inline-block;
      background: #e3f2fd;
      color: #1976d2;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-badge.active {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .status-badge.inactive {
      background: #ffebee;
      color: #c62828;
    }

    .member-actions {
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }

    .btn-primary, .btn-secondary {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      font-size: 14px;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }
  `]
})
export class MembersListComponent implements OnInit {
  members$: Observable<Member[]>;

  constructor(private dataService: DataService) {
    this.members$ = this.dataService.getMembers();
  }

  ngOnInit() {}
} 