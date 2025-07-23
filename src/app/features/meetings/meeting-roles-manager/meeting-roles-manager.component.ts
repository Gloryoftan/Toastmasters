import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest, map, BehaviorSubject } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Meeting, Assignment } from '../../../core/models/meeting.model';
import { Member } from '../../../core/models/member.model';
import { Role } from '../../../core/models/role.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meeting-roles-manager',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './meeting-roles-manager.component.html',
  styleUrls: ['./meeting-roles-manager.component.scss']
})
export class MeetingRolesManagerComponent implements OnInit {
  upcomingMeetings$: Observable<Meeting[]>;
  members$: Observable<Member[]>;
  roles$: Observable<Role[]>;
  filteredRoles$: Observable<Role[]>;

  roleAssignments: { [meetingId: string]: { [roleId: string]: string } } = {};

  constructor(private dataService: DataService) {
    this.members$ = this.dataService.getMembers();
    this.roles$ = this.dataService.getRoles();
    this.filteredRoles$ = this.roles$.pipe(
      map(roles => {
        // 定义角色顺序和要显示的角色ID
        const roleOrder = ['RL01', 'RL03', 'RL02', 'RL06', 'RL07', 'RL08', 'RL04', 'RL04', 'RL05', 'RL05'];
        const allowedRoleIds = new Set(roleOrder);
        
        // 过滤并排序角色
        const filteredRoles: Role[] = [];
        
        // 添加主持、即兴、总评、三官
        const singleRoles = ['RL01', 'RL03', 'RL02', 'RL06', 'RL07', 'RL08'];
        singleRoles.forEach(roleId => {
          const role = roles.find(r => r.id === roleId);
          if (role) {
            filteredRoles.push(role);
          }
        });
        
        // 添加两组备稿
        const speakerRole = roles.find(r => r.id === 'RL04');
        if (speakerRole) {
          filteredRoles.push({ ...speakerRole, id: 'RL04_1', chineseName: '备稿演讲1', englishName: 'Speaker 1' });
          filteredRoles.push({ ...speakerRole, id: 'RL05_1', chineseName: '个评1', englishName: 'Evaluator 1' });
          filteredRoles.push({ ...speakerRole, id: 'RL04_2', chineseName: '备稿演讲2', englishName: 'Speaker 2' });
          filteredRoles.push({ ...speakerRole, id: 'RL05_2', chineseName: '个评2', englishName: 'Evaluator 2' });
        }
        
        return filteredRoles;
      })
    );
    this.upcomingMeetings$ = this.dataService.getMeetings().pipe(
      map(meetings => meetings
        .filter(m => m.status === 'scheduled' && new Date(m.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 4)
      )
    );
  }

  ngOnInit(): void {
    this.upcomingMeetings$.subscribe(meetings => {
      this.initializeRoleAssignments(meetings);
    });
  }

  initializeRoleAssignments(meetings: Meeting[]): void {
    this.roleAssignments = {};
    meetings.forEach(meeting => {
      this.roleAssignments[meeting.id] = {};
      this.filteredRoles$.subscribe(roles => {
        roles.forEach(role => {
          // 处理扩展角色ID的初始化
          let assignment;
          if (role.id.startsWith('RL04_')) {
            assignment = meeting.assignments.find(a => a.roleId === 'RL04');
          } else if (role.id.startsWith('RL05_')) {
            assignment = meeting.assignments.find(a => a.roleId === 'RL05');
          } else {
            assignment = meeting.assignments.find(a => a.roleId === role.id);
          }
          this.roleAssignments[meeting.id][role.id] = assignment ? assignment.memberId : '';
        });
      });
    });
  }

  onRoleChange(meeting: Meeting, roleId: string, memberId: string): void {
    this.roleAssignments[meeting.id][roleId] = memberId;
  }

  saveChanges(): void {
    this.upcomingMeetings$.subscribe(meetings => {
      meetings.forEach(meeting => {
        const updatedAssignments: Assignment[] = [];
        const roleIds = Object.keys(this.roleAssignments[meeting.id]);

        roleIds.forEach(roleId => {
          const memberId = this.roleAssignments[meeting.id][roleId];
          if (memberId) {
            // 将扩展的角色ID映射回原始角色ID
            let originalRoleId = roleId;
            if (roleId.startsWith('RL04_')) {
              originalRoleId = 'RL04';
            } else if (roleId.startsWith('RL05_')) {
              originalRoleId = 'RL05';
            }
            
            // 检查是否已存在相同角色的分配，避免重复
            const existingAssignment = updatedAssignments.find(a => a.roleId === originalRoleId);
            if (!existingAssignment) {
              updatedAssignments.push({ roleId: originalRoleId, memberId });
            }
          }
        });

        const updatedMeeting: Meeting = {
          ...meeting,
          assignments: updatedAssignments
        };

        this.dataService.updateMeeting(updatedMeeting);
      });
    });
    alert('角色分配已保存成功！');
  }

  getMemberName(memberId: string, members: Member[]): string {
    const member = members.find(m => m.id === memberId);
    return member ? member.englishName : '';
  }
}