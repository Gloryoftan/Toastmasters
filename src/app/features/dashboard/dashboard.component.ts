import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, map, combineLatest } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { Member } from '../../core/models/member.model';
import { Meeting } from '../../core/models/meeting.model';
import { Venue } from '../../core/models/venue.model';
import { Officer } from '../../core/models/past-officers.model';

interface DashboardMeetingView extends Meeting {
  venueName: string;
  typeText: string;
  assignmentCount: number;
  visitorCount: number;
  speechCount: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard">
      <div class="dashboard-stats">
        <div class="stat-card">
          <h3>总会员数</h3>
          <span class="stat-number">{{ (members$ | async)?.length || 0 }}</span>
        </div>
        <div class="stat-card">
          <h3>活跃会员</h3>
          <span class="stat-number">{{ (activeMembers$ | async) || 0 }}</span>
        </div>
        <div class="stat-card">
          <h3>已举行会议</h3>
          <span class="stat-number">{{ (completedMeetings$ | async) || 0 }}</span>
        </div>
        <div class="stat-card">
          <h3>计划会议</h3>
          <span class="stat-number">{{ (scheduledMeetings$ | async) || 0 }}</span>
        </div>
      </div>

      <div class="dashboard-content">
        <div class="recent-meetings">
          <h2>最近会议</h2>
          <div class="meeting-list" *ngIf="recentMeetings$ | async as meetings">
            <div class="meeting-item" *ngFor="let meeting of meetings">
              <div class="meeting-info">
                <div class="meeting-header">
                  <h4>{{ meeting.theme || '第' + meeting.meetingNumber + '次会议' }}</h4>
                  <span class="type-badge" [class]="meeting.type">{{ meeting.typeText }}</span>
                </div>
                <div class="meeting-details">
                  <div class="detail-row">
                    <span class="detail-label">📅</span>
                    <span>{{ meeting.date | date:'yyyy年MM月dd日' }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">📍</span>
                    <span class="venue-info">
                      <span class="venue-name">{{ meeting.venueName }}</span>
                      <span class="venue-id">({{ meeting.venue }})</span>
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">👥</span>
                    <span class="counts">
                      角色: {{ meeting.assignmentCount }} | 备稿: {{ meeting.speechCount }} | 访客: {{ meeting.visitorCount }}
                    </span>
                  </div>
                </div>
                <span class="meeting-status" [class]="meeting.status">{{ getStatusText(meeting.status) }}</span>
              </div>
              <button class="btn-secondary" [routerLink]="['/meetings', meeting.id]">查看详情</button>
            </div>
          </div>
          <div *ngIf="(recentMeetings$ | async)?.length === 0" class="empty-state">
            <p>还没有会议记录</p>
          </div>
          <div class="view-all">
            <button class="btn-link" routerLink="/meetings">查看所有会议 →</button>
          </div>
        </div>

        <div class="sidebar">
          <div class="quick-actions">
            <h2>快速操作</h2>
            <div class="action-buttons">
              <button class="btn-primary" routerLink="/meetings">管理会议</button>
              <button class="btn-secondary" routerLink="/members">管理会员</button>
              <button class="btn-secondary" routerLink="/statistics">查看统计</button>
              <button class="btn-secondary" routerLink="/reports">生成报告</button>
            </div>
          </div>

          <div class="current-officers">
            <h2>官员团队</h2>
            <ul *ngIf="currentOfficersView$ | async as officers; else loadingOfficers">
              <li *ngFor="let officer of officers">
                <span class="officer-role">{{ officer.officeName }}</span>
                <span>：</span>
                <span class="officer-member">{{ officer.memberName }}</span>
              </li>
              <li *ngIf="officers.length === 0">暂无官员数据</li>
            </ul>
            <ng-template #loadingOfficers>
              <span>加载中...</span>
            </ng-template>
          </div>

          <div class="contact-info">
            <h2>联系方式</h2>
            <div class="contact-card">
              <div class="contact-header">
                <div class="avatar">
                  <div class="avatar-bg">
                    <span class="avatar-icon">💻</span>
                    <div class="avatar-badge">👨‍💻</div>
                  </div>
                </div>
                <div class="contact-details">
                  <h3>Samari</h3>
                  <p class="title">🚀 系统开发者</p>
                  <p class="subtitle">Full Stack Developer</p>
                </div>
              </div>
              
              <div class="contact-methods">
                <div class="contact-item">
                  <span class="contact-icon">💬</span>
                  <div class="contact-text">
                    <label>微信号</label>
                    <div class="wechat-container">
                      <span class="contact-value" [class.revealed]="wechatRevealed">
                        {{ wechatRevealed ? 'Samari_Tan' : 'Samari_***' }}
                      </span>
                      <button 
                        class="copy-btn" 
                        (click)="copyWechat()"
                        [title]="wechatRevealed ? '点击复制微信号' : '点击显示并复制微信号'"
                      >
                        <span *ngIf="!copySuccess">📋</span>
                        <span *ngIf="copySuccess">✅</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="contact-item">
                  <span class="contact-icon">📱</span>
                  <div class="contact-text">
                    <label>联系说明</label>
                    <span class="contact-note">系统使用问题或建议</span>
                  </div>
                </div>
              </div>
              
              <div class="contact-footer">
                <p class="help-text">如有系统使用问题，请随时联系</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .dashboard-header h1 {
      color: #1976d2;
      margin-bottom: 8px;
    }

    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-card h3 {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #1976d2;
    }

    .dashboard-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }



    .recent-meetings, .quick-actions {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .meeting-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 0;
      border-bottom: 1px solid #eee;
      gap: 16px;
    }

    .meeting-item:last-child {
      border-bottom: none;
    }

    .meeting-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .meeting-header {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .meeting-header h4 {
      margin: 0;
      color: #333;
      font-size: 16px;
    }

    .meeting-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .detail-label {
      font-size: 16px;
      width: 20px;
    }

    .venue-info {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .venue-name {
      font-weight: 500;
      color: #333;
    }

    .venue-id {
      color: #666;
      font-size: 12px;
    }

    .counts {
      color: #1976d2;
      font-weight: 500;
      font-size: 13px;
    }

    .type-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
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

    .meeting-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      white-space: nowrap;
    }

    .meeting-status.completed {
      background: #e8f5e8;
      color: #2e7d2e;
    }

    .meeting-status.scheduled {
      background: #fff3cd;
      color: #856404;
    }

    .meeting-status.cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .meeting-status.draft {
      background: #e2e3e5;
      color: #6c757d;
    }

    .meeting-status.in-progress {
      background: #cce5ff;
      color: #0066cc;
    }

    .view-all {
      text-align: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .btn-link {
      background: none;
      border: none;
      color: #1976d2;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
      padding: 8px 0;
      transition: color 0.2s;
    }

    .btn-link:hover {
      color: #1565c0;
      text-decoration: underline;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      font-weight: 500;
      transition: background-color 0.2s, transform 0.1s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .btn-primary {
      background: #1976d2;
      color: white;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #333;
    }

    .btn-primary:hover {
      background: #1565c0;
      transform: translateY(-1px);
    }

    .btn-secondary:hover {
      background: #eeeeee;
      transform: translateY(-1px);
    }

    .empty-state {
      text-align: center;
      color: #666;
      padding: 40px 0;
    }

    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .current-officers {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .current-officers h2 {
      margin-bottom: 16px;
      color: #333;
      text-align: center;
    }

    .current-officers ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }

    .current-officers li {
      font-size: 15px;
      color: #555;
      margin-bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      max-width: 320px;
      border-bottom: 1px solid #f0f0f0;
      padding: 10px 0;
    }

    .current-officers li:last-child {
      border-bottom: none;
    }

    .current-officers .officer-role {
      font-weight: 600;
      color: #1976d2;
      flex: 1;
      text-align: right;
      margin-right: 12px;
      min-width: 120px;
    }

    .current-officers .officer-member {
      color: #333;
      flex: 1;
      text-align: left;
      margin-left: 12px;
      min-width: 100px;
    }

    .current-officers span {
      font-size: 15px;
    }

    .contact-info {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .contact-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .contact-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

         .avatar {
       position: relative;
       display: flex;
       align-items: center;
       justify-content: center;
     }

     .avatar-bg {
       position: relative;
       width: 80px;
       height: 80px;
       background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
       box-shadow: 0 8px 32px rgba(0,0,0,0.15);
       border: 3px solid white;
     }

     .avatar-icon {
       font-size: 36px;
       color: white;
       text-shadow: 0 2px 4px rgba(0,0,0,0.3);
     }

     .avatar-badge {
       position: absolute;
       bottom: -2px;
       right: -2px;
       width: 32px;
       height: 32px;
       background: #4caf50;
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
       font-size: 18px;
       border: 3px solid white;
       box-shadow: 0 2px 8px rgba(0,0,0,0.2);
     }

    .contact-details h3 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 18px;
    }

         .title {
       color: #1976d2;
       font-size: 16px;
       font-weight: 600;
       margin: 0 0 4px 0;
     }

     .subtitle {
       color: #666;
       font-size: 13px;
       font-style: italic;
       margin: 0;
     }

    .contact-methods {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .contact-icon {
      font-size: 24px;
      color: #1976d2;
    }

         .contact-text {
       display: flex;
       flex-direction: column;
       gap: 4px;
     }

     .contact-text label {
       font-size: 12px;
       color: #666;
       margin-bottom: 4px;
     }

     .wechat-container {
       display: flex;
       align-items: center;
       gap: 8px;
     }

     .contact-value {
       font-weight: 500;
       color: #333;
       font-size: 14px;
       transition: all 0.3s ease;
       font-family: 'Courier New', monospace;
     }

     .contact-value:not(.revealed) {
       color: #999;
       letter-spacing: 1px;
     }

     .contact-value.revealed {
       color: #1976d2;
       font-weight: 600;
     }

     .copy-btn {
       background: #f0f7ff;
       border: 1px solid #e3f2fd;
       border-radius: 6px;
       padding: 6px 8px;
       cursor: pointer;
       font-size: 14px;
       transition: all 0.2s ease;
       display: flex;
       align-items: center;
       justify-content: center;
       min-width: 32px;
       height: 28px;
     }

     .copy-btn:hover {
       background: #e3f2fd;
       border-color: #bbdefb;
       transform: translateY(-1px);
     }

     .copy-btn:active {
       transform: translateY(0);
     }

    .contact-note {
      color: #666;
      font-size: 13px;
    }

    .contact-footer {
      text-align: center;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .help-text {
      color: #666;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .btn-primary, .btn-secondary {
        padding: 10px 8px;
        font-size: 13px;
        line-height: 1.2;
      }

      .contact-header {
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

             .avatar-bg {
         width: 64px;
         height: 64px;
       }

       .avatar-icon {
         font-size: 28px;
       }

       .avatar-badge {
         width: 26px;
         height: 26px;
         font-size: 14px;
       }

      .contact-methods {
        gap: 10px;
      }

             .contact-item {
         gap: 10px;
       }

       .wechat-container {
         gap: 6px;
       }

       .copy-btn {
         min-width: 28px;
         height: 24px;
         padding: 4px 6px;
         font-size: 12px;
       }
    }

    @media (max-width: 576px) {
      .meeting-item {
        flex-direction: column;
        align-items: stretch;
      }

      .meeting-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .detail-row {
        font-size: 13px;
      }

      .btn-secondary {
        align-self: flex-start;
      }

      .action-buttons {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .btn-primary, .btn-secondary {
        padding: 12px 12px;
        font-size: 14px;
        white-space: normal;
        line-height: 1.3;
      }

      .contact-info {
        padding: 16px;
      }

      .contact-header {
        gap: 8px;
      }

             .avatar-bg {
         width: 56px;
         height: 56px;
       }

       .avatar-icon {
         font-size: 24px;
       }

       .avatar-badge {
         width: 22px;
         height: 22px;
         font-size: 12px;
       }

      .contact-details h3 {
        font-size: 16px;
      }

      .contact-icon {
        font-size: 20px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  members$: Observable<Member[]>;
  meetings$: Observable<Meeting[]>;
  recentMeetings$: Observable<DashboardMeetingView[]>;
  activeMembers$: Observable<number>;
  completedMeetings$: Observable<number>;
  scheduledMeetings$: Observable<number>;
  currentOfficers$: Observable<Officer[]>;
  currentOfficersView$: Observable<{ officeName: string; memberName: string }[]>;
  
  // 微信号显示和复制状态
  wechatRevealed = false;
  copySuccess = false;

  constructor(private dataService: DataService) {
    this.members$ = this.dataService.getMembers();
    this.meetings$ = this.dataService.getMeetings();
    this.currentOfficers$ = this.dataService.getCurrentOfficers();
    this.currentOfficersView$ = combineLatest([
      this.currentOfficers$,
      this.dataService.getOfficerPositions(),
      this.members$
    ]).pipe(
      map(([officers, officerPositions, members]) => {
        return officers.map(officer => {
          const position = officerPositions.find(p => p.id === officer.officeId);
          const member = members.find(m => m.id === officer.memberId);
          return {
            officeName: position?.chineseName || position?.englishName || officer.officeId,
            memberName: member?.englishName || member?.chineseName || officer.memberId
          };
        });
      })
    );
    // 恢复recentMeetings$初始化
    this.recentMeetings$ = combineLatest([
      this.dataService.getMeetings(),
      this.dataService.getVenues()
    ]).pipe(
      map(([meetings, venues]) => {
        return meetings
          .filter(m => m.status === 'completed')
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5)
          .map(meeting => {
            const venue = venues.find(v => v.id === meeting.venue);
            return {
              ...meeting,
              venueName: venue ? venue.name : meeting.venue,
              typeText: this.getTypeText(meeting.type),
              assignmentCount: meeting.assignments.length,
              visitorCount: meeting.visitors.length,
              speechCount: meeting.speeches.length
            } as DashboardMeetingView;
          });
      })
    );
    this.activeMembers$ = this.members$.pipe(
      map(members => members.filter(m => m.membershipType === 'member').length)
    );
    this.completedMeetings$ = this.meetings$.pipe(
      map(meetings => meetings.filter(m => m.status === 'completed').length)
    );
    this.scheduledMeetings$ = this.meetings$.pipe(
      map(meetings => meetings.filter(m => m.status === 'scheduled').length)
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

  copyWechat() {
    const wechatId = 'Samari_Tan';
    
    // 显示完整微信号
    this.wechatRevealed = true;
    
    // 复制到剪贴板
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(wechatId).then(() => {
        this.showCopySuccess();
      }).catch(() => {
        this.fallbackCopy(wechatId);
      });
    } else {
      this.fallbackCopy(wechatId);
    }
  }

  private fallbackCopy(text: string) {
    // 降级方案：创建临时文本区域
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopySuccess();
    } catch (err) {
      console.warn('复制失败，请手动复制:', text);
    }
    
    document.body.removeChild(textArea);
  }

  private showCopySuccess() {
    this.copySuccess = true;
    setTimeout(() => {
      this.copySuccess = false;
    }, 2000);
  }
} 