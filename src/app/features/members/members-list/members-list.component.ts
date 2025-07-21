import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, map, startWith, combineLatest } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Member, MembershipType, MembershipTypeLabels } from '../../../core/models/member.model';

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
  filterControl = new FormControl<MembershipType | ''>('');
  public MembershipTypeLabels = MembershipTypeLabels;

  // 会员类型选项
  membershipTypeOptions = [
    { value: '', label: '所有会员' },
    ...Object.entries(MembershipTypeLabels).map(([value, label]) => ({ value, label }))
  ];

  constructor(private dataService: DataService) {
    this.members$ = this.dataService.getMembers();
    
    // 创建过滤后的会员列表
    this.filteredMembers$ = combineLatest([
      this.members$,
      this.searchControl.valueChanges.pipe(startWith('')),
      this.filterControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([members, searchTerm, filterType]) => {
        let filteredMembers = members;
        
        // 按会员类型筛选
        if (filterType && filterType !== '') {
          filteredMembers = filteredMembers.filter(member => member.membershipType === filterType);
        }
        
        // 按搜索词筛选
        if (searchTerm && searchTerm.trim() !== '') {
          const searchLower = searchTerm.toLowerCase().trim();
          filteredMembers = filteredMembers.filter(member => 
            member.englishName.toLowerCase().includes(searchLower) ||
            (member.chineseName && member.chineseName.toLowerCase().includes(searchLower)) ||
            (member.toastmastersId && member.toastmastersId.toLowerCase().includes(searchLower)) ||
            this.getMemberStatusText(member.membershipType).toLowerCase().includes(searchLower)
          );
        }
        
        return filteredMembers;
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

  clearFilter() {
    this.filterControl.setValue('');
  }

  clearAllFilters() {
    this.searchControl.setValue('');
    this.filterControl.setValue('');
  }
} 