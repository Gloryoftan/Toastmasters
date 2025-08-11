import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable, map, switchMap, tap, catchError, of } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Member, MembershipType, MembershipTypeLabels } from '../../../core/models/member.model';
import { Pathways } from '../../../core/models/project.model';

@Component({
  selector: 'app-member-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './member-editor.component.html',
  styleUrls: ['./member-editor.component.scss']
})
export class MemberEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);

  memberForm!: FormGroup;
  member$!: Observable<Member | undefined>;
  
  isNewMember = false;
  isLoading = true;

  // 会员类型选项
  membershipTypes = Object.entries(MembershipTypeLabels).map(([value, label]) => ({
    value,
    label
  }));

  // 性别选项
  genderOptions = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' }
  ];

  // Pathways选项
  pathwaysOptions: Pathways[] = [
    'Dynamic Leadership',
    'Presentation Mastery',
    'Visionary Communication',
    'Motivational Strategies',
    'Team Collaboration',
    'Strategic Relationships',
    'Engaging Humor',
    'Effective Coaching',
    'Innovative Planning',
    'Leadership Development',
    'Persuasive Influence'
  ];

  ngOnInit() {
    this.setupForm();
    this.loadMember();
  }

  private setupForm() {
    this.memberForm = this.fb.group({
      id: ['', Validators.required],
      englishName: ['', [Validators.required, Validators.minLength(2)]],
      chineseName: [''],
      membershipType: ['member', Validators.required],
      additionalMembershipTypes: this.fb.array([]),
      toastmastersId: [''],
      joinDate: [''],
      gender: [''],
      pathways: this.fb.array([]),
      credentials: [''],
      email: ['', [Validators.email]],
      phone: [''],
      birthDate: [''],
      notes: ['']
    });
  }

  private loadMember() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      
      this.isNewMember = !id || id === 'new';
      this.isLoading = false;
      
      if (this.isNewMember) {
        this.createNewMember();
      } else {
        this.loadExistingMember(id);
      }
    });
  }

  private createNewMember() {
    const newMember: Member = {
      id: this.generateMemberId(),
      englishName: '',
      membershipType: 'member',
      chineseName: '',
      joinDate: new Date(),
      gender: 'male',
      pathways: [],
      credentials: '',
      email: '',
      phone: '',
      notes: ''
    };
    
    this.populateForm(newMember);
  }

  private generateMemberId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `M${timestamp}${random}`;
  }

  private loadExistingMember(id: string) {
    console.log('开始加载会员，ID:', id);
    this.dataService.getMemberById(id).subscribe({
      next: (member) => {
        console.log('获取到会员数据:', member);
        if (member) {
          this.populateForm(member);
        } else {
          console.error('会员未找到:', id);
          this.router.navigate(['/members']);
        }
      },
      error: (error) => {
        console.error('加载会员失败:', error);
        this.router.navigate(['/members']);
      }
    });
  }

  private populateForm(member: Member) {
    console.log('开始填充表单，会员数据:', member);
    
    // 清空表单数组
    this.clearFormArrays();
    
    // 设置基本字段
    const formData = {
      id: member.id,
      englishName: member.englishName,
      chineseName: member.chineseName || '',
      membershipType: member.membershipType,
      toastmastersId: member.toastmastersId || '',
      joinDate: member.joinDate ? this.formatDateForInput(member.joinDate) : '',
      gender: member.gender || '',
      credentials: member.credentials || '',
      email: member.email || '',
      phone: member.phone || '',
      birthDate: member.birthDate ? this.formatDateForInput(member.birthDate) : '',
      notes: member.notes || ''
    };
    
    console.log('表单数据:', formData);
    
    this.memberForm.patchValue(formData);
    
    console.log('表单填充完成，当前表单值:', this.memberForm.value);

    // 设置附加会员类型
    if (member.additionalMembershipTypes) {
      member.additionalMembershipTypes.forEach(type => {
        this.addAdditionalMembershipType(type);
      });
    }

    // 设置Pathways
    if (member.pathways) {
      member.pathways.forEach(pathway => {
        this.addPathway(pathway);
      });
    }
  }

  private clearFormArrays() {
    while (this.additionalMembershipTypesArray.length !== 0) {
      this.additionalMembershipTypesArray.removeAt(0);
    }
    while (this.pathwaysArray.length !== 0) {
      this.pathwaysArray.removeAt(0);
    }
  }

  private formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    
    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return '';
    }
    
    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    // 格式化为 YYYY-MM-DD 格式
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  // Getter方法
  get additionalMembershipTypesArray(): FormArray {
    return this.memberForm.get('additionalMembershipTypes') as FormArray;
  }

  get pathwaysArray(): FormArray {
    return this.memberForm.get('pathways') as FormArray;
  }

  // 添加附加会员类型
  addAdditionalMembershipType(type?: MembershipType) {
    const control = this.fb.control(type || 'guest');
    this.additionalMembershipTypesArray.push(control);
  }

  // 移除附加会员类型
  removeAdditionalMembershipType(index: number) {
    this.additionalMembershipTypesArray.removeAt(index);
  }

  // 添加Pathway
  addPathway(pathway?: Pathways) {
    const control = this.fb.control(pathway || 'Dynamic Leadership');
    this.pathwaysArray.push(control);
  }

  // 移除Pathway
  removePathway(index: number) {
    this.pathwaysArray.removeAt(index);
  }

  // 保存会员
  saveMember() {
    if (this.memberForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.memberForm.value;
    
    // 转换日期字段
    const memberData: Member = {
      ...formValue,
      joinDate: formValue.joinDate ? new Date(formValue.joinDate) : '',
      birthDate: formValue.birthDate ? new Date(formValue.birthDate) : '',
      additionalMembershipTypes: formValue.additionalMembershipTypes || [],
      pathways: formValue.pathways || []
    };

    console.log('准备保存会员数据:', memberData);

    if (this.isNewMember) {
      // 创建新会员
      this.dataService.createMember(memberData).subscribe({
        next: (response) => {
          console.log('✅ 新会员创建成功:', response);
          this.router.navigate(['/members', memberData.id]);
        },
        error: (error) => {
          console.error('❌ 创建会员失败:', error);
          alert('创建会员失败，请重试');
        }
      });
    } else {
      // 更新现有会员
      this.dataService.updateMember(memberData).subscribe({
        next: (response) => {
          console.log('✅ 会员更新成功:', response);
          this.router.navigate(['/members', memberData.id]);
        },
        error: (error) => {
          console.error('❌ 更新会员失败:', error);
          alert('更新会员失败，请重试');
        }
      });
    }
  }

  // 取消编辑
  cancel() {
    this.router.navigate(['/members']);
  }

  // 标记所有表单控件为已触摸状态
  private markFormGroupTouched() {
    Object.keys(this.memberForm.controls).forEach(key => {
      const control = this.memberForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }

  // 获取会员类型显示文本
  getMembershipTypeText(type: string): string {
    return MembershipTypeLabels[type as MembershipType] || type;
  }

  // 获取Pathway显示文本
  getPathwayDisplayName(pathway: string): string {
    const pathwayMap: Record<string, string> = {
      'Dynamic Leadership': '动态领导力',
      'Presentation Mastery': '演讲精通',
      'Visionary Communication': '远见沟通',
      'Motivational Strategies': '激励策略',
      'Team Collaboration': '团队协作',
      'Strategic Relationships': '战略关系',
      'Engaging Humor': '幽默魅力',
      'Effective Coaching': '有效指导',
      'Innovative Planning': '创新规划',
      'Leadership Development': '领导力发展',
      'Persuasive Influence': '说服影响力'
    };
    return pathwayMap[pathway] || pathway;
  }
}
