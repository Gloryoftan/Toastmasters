import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable, map, switchMap, tap, catchError, of } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Member, MembershipType, MembershipTypeLabels } from '../../../core/models/member.model';
import { Pathway } from '../../../core/models/project.model';

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
  pathwaysOptions: Pathway[] = [
    { id: 'PW01', englishName: 'Dynamic Leadership', chineseName: '动态领导力' },
    { id: 'PW02', englishName: 'Presentation Mastery', chineseName: '演讲精通' },
    { id: 'PW03', englishName: 'Visionary Communication', chineseName: '远见沟通' },
    { id: 'PW04', englishName: 'Motivational Strategies', chineseName: '激励策略' },
    { id: 'PW05', englishName: 'Team Collaboration', chineseName: '团队协作' },
    { id: 'PW06', englishName: 'Strategic Relationships', chineseName: '战略关系' },
    { id: 'PW07', englishName: 'Engaging Humor', chineseName: '幽默演讲' },
    { id: 'PW08', englishName: 'Effective Coaching', chineseName: '有效指导' },
    { id: 'PW09', englishName: 'Innovative Planning', chineseName: '创新规划' },
    { id: 'PW10', englishName: 'Leadership Development', chineseName: '领导力发展' },
    { id: 'PW11', englishName: 'Persuasive Influence', chineseName: '说服影响力' }
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
      pathwaysIds: this.fb.array([]),
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
      pathwaysIds: [],
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
    if (member.pathwaysIds) {
      member.pathwaysIds.forEach(pathwayId => {
        this.addPathway(pathwayId);
      });
    }
  }

  private clearFormArrays() {
    while (this.additionalMembershipTypesArray.length !== 0) {
      this.additionalMembershipTypesArray.removeAt(0);
    }
    while (this.pathwaysIdsArray.length !== 0) {
      this.pathwaysIdsArray.removeAt(0);
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

  get pathwaysIdsArray(): FormArray {
    return this.memberForm.get('pathwaysIds') as FormArray;
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
  addPathway(pathwayId?: string) {
    const control = this.fb.control(pathwayId || 'PW01');
    this.pathwaysIdsArray.push(control);
  }

  // 移除Pathway
  removePathway(index: number) {
    this.pathwaysIdsArray.removeAt(index);
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
      pathwaysIds: formValue.pathwaysIds || []
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
  getPathwayDisplayName(pathwayId: string): string {
    const pathway = this.pathwaysOptions.find(p => p.id === pathwayId);
    return pathway ? pathway.chineseName : pathwayId;
  }
}
