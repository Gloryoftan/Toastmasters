import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, map, startWith, combineLatest } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Member } from '../../../core/models/member.model';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.scss']
})
export class MembersListComponent implements OnInit {
  members$: Observable<Member[]>;
  filteredMembers$: Observable<Member[]>;
  searchControl = new FormControl('');

  constructor(private dataService: DataService) {
    this.members$ = this.dataService.getMembers();
    
    // 创建过滤后的会员列表
    this.filteredMembers$ = combineLatest([
      this.members$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([members, searchTerm]) => {
        if (!searchTerm || searchTerm.trim() === '') {
          return members;
        }
        
        const searchLower = searchTerm.toLowerCase().trim();
        return members.filter(member => 
          member.englishName.toLowerCase().includes(searchLower) ||
          (member.chineseName && member.chineseName.toLowerCase().includes(searchLower)) ||
          (member.toastmastersId && member.toastmastersId.toLowerCase().includes(searchLower)) ||
          this.getMemberStatusText(member.membershipType).toLowerCase().includes(searchLower)
        );
      })
    );
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

  clearSearch() {
    this.searchControl.setValue('');
  }
} 