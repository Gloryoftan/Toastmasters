import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { AttendanceStats } from '../../core/models/statistics.model';
import { Member } from '../../core/models/member.model';
import { Role } from '../../core/models/role.model';
import { Project } from '../../core/models/project.model';
import { map } from 'rxjs/operators';

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

      <!-- 参考信息表格区域 -->
      <div class="reference-section">
        <div class="section-header">
          <h2>参考信息表</h2>
          <div class="table-tabs">
            <button class="tab-button" [class.active]="activeTab === 'members'" (click)="setActiveTab('members')">
              会员信息 ({{ (members$ | async)?.length || 0 }})
            </button>
            <button class="tab-button" [class.active]="activeTab === 'roles'" (click)="setActiveTab('roles')">
              角色信息 ({{ (roles$ | async)?.length || 0 }})
            </button>
            <button class="tab-button" [class.active]="activeTab === 'projects'" (click)="setActiveTab('projects')">
              项目信息 ({{ (projects$ | async)?.length || 0 }})
            </button>
          </div>
        </div>

        <!-- 会员信息表 -->
        <div class="tab-content" [class.active]="activeTab === 'members'">
          <div class="stats-table" *ngIf="members$ | async as members">
            <table>
              <thead>
                <tr>
                  <th>会员ID</th>
                  <th>英文姓名</th>
                  <th>中文姓名</th>
                  <th>TM ID</th>
                  <th>会员类型</th>
                  <th>加入日期</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let member of members; trackBy: trackByMemberId">
                  <td class="id-cell clickable" (click)="copyToClipboard(member.id)" [title]="'点击复制ID: ' + member.id">{{ member.id }}</td>
                  <td>{{ member.englishName }}</td>
                  <td>{{ member.chineseName || '-' }}</td>
                  <td>{{ member.toastmastersId || '-' }}</td>
                  <td>{{ getMembershipTypeText(member.membershipType) }}</td>
                  <td>{{ member.joinDate ? (member.joinDate | date:'yyyy-MM-dd') : '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 角色信息表 -->
        <div class="tab-content" [class.active]="activeTab === 'roles'">
          <div class="stats-table" *ngIf="roles$ | async as roles">
            <table>
              <thead>
                <tr>
                  <th>角色ID</th>
                  <th>英文名称</th>
                  <th>中文名称</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let role of roles; trackBy: trackByRoleId">
                  <td class="id-cell clickable" (click)="copyToClipboard(role.id)" [title]="'点击复制ID: ' + role.id">{{ role.id }}</td>
                  <td>{{ role.englishName }}</td>
                  <td>{{ role.chineseName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 项目信息表 -->
        <div class="tab-content" [class.active]="activeTab === 'projects'">
          <div class="stats-table" *ngIf="projects$ | async as projects">
            <table>
              <thead>
                <tr>
                  <th>项目ID</th>
                  <th>英文名称</th>
                  <th>中文名称</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let project of projects; trackBy: trackByProjectId">
                  <td class="id-cell clickable" (click)="copyToClipboard(project.id)" [title]="'点击复制ID: ' + project.id">{{ project.id }}</td>
                  <td>{{ project.englishName }}</td>
                  <td>{{ project.chineseName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 复制反馈提示 -->
      <div class="copy-feedback" *ngIf="showCopyFeedback">
        已复制ID: {{ copiedId }}
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

    .reference-section {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 24px;
      overflow: hidden;
    }

    .section-header {
      background: #f8f9fa;
      padding: 20px 24px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .section-header h2 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 20px;
    }

    .table-tabs {
      display: flex;
      gap: 0;
      margin-bottom: -1px;
    }

    .tab-button {
      padding: 12px 20px;
      border: 1px solid #e0e0e0;
      border-bottom: none;
      background: white;
      color: #666;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      border-radius: 6px 6px 0 0;
      position: relative;
    }

    .tab-button:hover {
      background: #f5f5f5;
      color: #333;
    }

    .tab-button.active {
      background: white;
      color: #1976d2;
      border-color: #1976d2;
      z-index: 1;
    }

    .tab-button.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: white;
    }

    .tab-content {
      display: none;
      padding: 24px;
      animation: fadeIn 0.3s ease-in-out;
    }

    .tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from { 
        opacity: 0;
        transform: translateY(10px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    .id-cell {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: #1976d2;
      background: #f0f8ff;
    }

    .clickable {
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }

    .clickable:hover {
      background: #e3f2fd !important;
      transform: scale(1.02);
      box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
    }

    .clickable:active {
      transform: scale(0.98);
    }

    tbody tr:hover {
      background: #f9f9f9;
    }

    .copy-feedback {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: fadeInOut 2s ease-in-out;
    }

    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-20px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-20px); }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  attendanceStats$: Observable<AttendanceStats[]>;
  members$: Observable<Member[]>;
  roles$: Observable<Role[]>;
  projects$: Observable<Project[]>;
  showCopyFeedback = false;
  copiedId = '';
  activeTab = 'members';

  constructor(private dataService: DataService) {
    this.attendanceStats$ = this.dataService.getAttendanceStats().pipe(
      map(stats => stats
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .slice(0, 10)
      )
    );
    this.members$ = this.dataService.getMembers();
    this.roles$ = this.dataService.getRoles();
    this.projects$ = this.dataService.getProjects();
  }

  ngOnInit() {}

  getMembershipTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'member': '正式会员',
      'former_member': '前会员',
      'honorary_member': '荣誉会员',
      'other_club_member': '其他俱乐部会员',
      'visitor': '访客',
      'guest': '嘉宾',
      'other': '其他'
    };
    return typeMap[type] || type;
  }

  async copyToClipboard(id: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(id);
      this.showCopySuccess(id);
    } catch (err) {
      // 降级方案：使用传统的复制方法
      this.fallbackCopyToClipboard(id);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
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
      this.showCopySuccess(text);
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制ID: ' + text);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  private showCopySuccess(id: string): void {
    this.copiedId = id;
    this.showCopyFeedback = true;
    
    // 2秒后隐藏提示
    setTimeout(() => {
      this.showCopyFeedback = false;
    }, 2000);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // TrackBy 函数优化性能
  trackByMemberId(index: number, member: Member): string {
    return member.id;
  }

  trackByRoleId(index: number, role: Role): string {
    return role.id;
  }

  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }
}
 