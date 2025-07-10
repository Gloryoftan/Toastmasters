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
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss']
})
export class MembersListComponent implements OnInit {
  members$: Observable<Member[]>;

  constructor(private dataService: DataService) {
    this.members$ = this.dataService.getMembers();
  }

  ngOnInit() {}

  getMemberStatusText(membershipType: string): string {
    const statusMap: { [key: string]: string } = {
      'member': '活跃',
      'former_member': '前会员',
      'honorary_member': '荣誉会员',
      'other_club_member': '其他俱乐部会员',
      'visitor': '访客',
      'guest': '嘉宾',
      'other': '其他'
    };
    return statusMap[membershipType] || '未知';
  }

  getMemberStatusClass(membershipType: string): string {
    const classMap: { [key: string]: string } = {
      'member': 'active',
      'former_member': 'inactive',
      'honorary_member': 'active',
      'other_club_member': 'guest',
      'visitor': 'guest',
      'guest': 'guest',
      'other': 'inactive'
    };
    return classMap[membershipType] || 'inactive';
  }
} 