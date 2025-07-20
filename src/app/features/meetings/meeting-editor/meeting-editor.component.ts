import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable, map, switchMap, tap, catchError, of } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Meeting, Assignment, Speech, Visitor, Attendee } from '../../../core/models/meeting.model';
import { Member } from '../../../core/models/member.model';
import { Role } from '../../../core/models/role.model';
import { Project } from '../../../core/models/project.model';
import { Venue } from '../../../core/models/venue.model';

@Component({
  selector: 'app-meeting-editor',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './meeting-editor.component.html',
  styleUrls: ['./meeting-editor.component.scss']
})
export class MeetingEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);

  meetingForm!: FormGroup;
  meeting$!: Observable<Meeting | undefined>;
  members$!: Observable<Member[]>;
  roles$!: Observable<Role[]>;
  projects$!: Observable<Project[]>;
  venues$!: Observable<Venue[]>;
  
  isNewMeeting = false;
  isLoading = true;

  // 会议类型选项
  meetingTypes = [
    { value: 'regular', label: '常规会议' },
    { value: 'special', label: '特别会议' },
    { value: 'contest', label: '比赛' },
    { value: 'training', label: '培训' }
  ];

  // 会议状态选项
  meetingStatuses = [
    { value: 'draft', label: '草稿' },
    { value: 'scheduled', label: '已安排' },
    { value: 'in-progress', label: '进行中' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' }
  ];

  // 演讲级别选项
  speechLevels = [
    'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Contest'
  ];

  ngOnInit() {
    this.initializeData();
    this.setupForm();
    this.loadMeeting();
  }

  private initializeData() {
    this.members$ = this.dataService.getMembers();
    this.roles$ = this.dataService.getRoles();
    this.projects$ = this.dataService.getProjects();
    this.venues$ = this.dataService.getVenues();
  }

  private setupForm() {
    this.meetingForm = this.fb.group({
      id: ['', Validators.required],
      date: ['', Validators.required],
      meetingNumber: ['', [Validators.required, Validators.min(1)]],
      theme: [''],
      venue: ['', Validators.required],
      type: ['regular', Validators.required],
      status: ['draft', Validators.required],
      assignments: this.fb.array([]),
      speeches: this.fb.array([]),
      visitors: this.fb.array([]),
      attendees: this.fb.array([]),
      notes: ['']
    });
  }

  private loadMeeting() {
    console.log(' loadMeeting called');
    
    // 直接订阅 route.params
    this.route.params.subscribe(params => {
      console.log('📋 Route params received:', params);
      const id = params['id'];
      console.log('🎯 Meeting ID:', id);
      
      this.isNewMeeting = !id || id === 'new';
      this.isLoading = false;
      console.log('📝 isNewMeeting:', this.isNewMeeting);
      
      if (this.isNewMeeting) {
        console.log('🆕 Creating new meeting');
        this.createNewMeeting().subscribe(meeting => {
          if (meeting) {
            this.populateForm(meeting);
          }
        });
      } else {
        console.log('🔍 Loading existing meeting');
        this.dataService.getMeetingById(id).subscribe(meeting => {
          console.log('✅ Meeting loaded:', meeting ? { id: meeting.id, number: meeting.meetingNumber } : null);
          if (meeting) {
            console.log('📝 Populating form');
            this.populateForm(meeting);
          }
        });
      }
    });
  }

  private createNewMeeting(): Observable<Meeting | undefined> {
    const newMeeting: Meeting = {
      id: this.generateMeetingId(),
      date: new Date(),
      meetingNumber: 1,
      theme: '',
      venue: '',
      type: 'regular',
      status: 'draft',
      assignments: [],
      speeches: [],
      visitors: [],
      attendees: [],
      notes: ''
    };
    return new Observable(observer => observer.next(newMeeting));
  }

  private generateMeetingId(): string {
    const timestamp = Date.now();
    return `MT${timestamp.toString().slice(-4)}`;
  }

  private populateForm(meeting: Meeting) {
    this.meetingForm.patchValue({
      id: meeting.id,
      date: new Date(meeting.date).toISOString().slice(0, 16),
      meetingNumber: meeting.meetingNumber,
      theme: meeting.theme || '',
      venue: meeting.venue,
      type: meeting.type,
      status: meeting.status,
      notes: meeting.notes || ''
    });

    // 清空并重新填充数组
    this.clearFormArrays();
    
    // 填充角色分配
    meeting.assignments.forEach(assignment => {
      this.addAssignment(assignment);
    });

    // 填充演讲
    meeting.speeches.forEach(speech => {
      this.addSpeech(speech);
    });

    // 填充访客
    meeting.visitors.forEach(visitor => {
      this.addVisitor(visitor);
    });

    // 填充参会人员
    meeting.attendees.forEach(attendee => {
      this.addAttendee(attendee);
    });
  }

  private clearFormArrays() {
    while (this.assignmentsArray.length) {
      this.assignmentsArray.removeAt(0);
    }
    while (this.speechesArray.length) {
      this.speechesArray.removeAt(0);
    }
    while (this.visitorsArray.length) {
      this.visitorsArray.removeAt(0);
    }
    while (this.attendeesArray.length) {
      this.attendeesArray.removeAt(0);
    }
  }

  // 表单数组访问器
  get assignmentsArray(): FormArray {
    return this.meetingForm.get('assignments') as FormArray;
  }

  get speechesArray(): FormArray {
    return this.meetingForm.get('speeches') as FormArray;
  }

  get visitorsArray(): FormArray {
    return this.meetingForm.get('visitors') as FormArray;
  }

  get attendeesArray(): FormArray {
    return this.meetingForm.get('attendees') as FormArray;
  }

  // 角色分配相关方法
  addAssignment(assignment?: Assignment) {
    const assignmentGroup = this.fb.group({
      roleId: [assignment?.roleId || '', Validators.required],
      memberId: [assignment?.memberId || '', Validators.required],
      notes: [assignment?.notes || '']
    });
    this.assignmentsArray.push(assignmentGroup);
  }

  removeAssignment(index: number) {
    this.assignmentsArray.removeAt(index);
  }

  // 演讲相关方法
  addSpeech(speech?: Speech) {
    const speechGroup = this.fb.group({
      memberId: [speech?.memberId || '', Validators.required],
      title: [speech?.title || '', Validators.required],
      level: [speech?.level || 'Level 1', Validators.required],
      projectId: [speech?.projectId || '', Validators.required],
      evaluatorId: [speech?.evaluatorId || '', Validators.required],
      passed: [speech?.passed || false],
      notes: [speech?.notes || '']
    });
    this.speechesArray.push(speechGroup);
  }

  removeSpeech(index: number) {
    this.speechesArray.removeAt(index);
  }

  // 访客相关方法
  addVisitor(visitor?: Visitor) {
    const visitorGroup = this.fb.group({
      memberId: [visitor?.memberId || '', Validators.required],
      contactId: [visitor?.contactId || '', Validators.required],
      source: [visitor?.source || ''],
      notes: [visitor?.notes || '']
    });
    this.visitorsArray.push(visitorGroup);
  }

  removeVisitor(index: number) {
    this.visitorsArray.removeAt(index);
  }

  // 参会人员相关方法
  addAttendee(attendee?: Attendee) {
    const attendeeGroup = this.fb.group({
      memberId: [attendee?.memberId || '', Validators.required],
      notes: [attendee?.notes || '']
    });
    this.attendeesArray.push(attendeeGroup);
  }

  removeAttendee(index: number) {
    this.attendeesArray.removeAt(index);
  }

  // 保存会议
  async saveMeeting() {
    if (this.meetingForm.valid) {
      const formValue = this.meetingForm.value;
      const meeting: Meeting = {
        ...formValue,
        date: new Date(formValue.date),
        assignments: formValue.assignments || [],
        speeches: formValue.speeches || [],
        visitors: formValue.visitors || [],
        attendees: formValue.attendees || []
      };

      try {
        // 注意：这里需要实现实际的保存逻辑
        // 由于当前DataService没有createMeeting和updateMeeting方法
        // 这里只是导航到会议详情页面
        console.log('保存会议:', meeting);
        this.router.navigate(['/meetings', meeting.id]);
      } catch (error) {
        console.error('保存会议失败:', error);
        // 这里可以添加错误提示
      }
    }
  }

  // 取消编辑
  cancel() {
    this.router.navigate(['/meetings']);
  }

  // 获取会员显示名称
  getMemberDisplayName(memberId: string, members: Member[]): string {
    const member = members.find(m => m.id === memberId);
    if (!member) return memberId;
    return `${member.englishName}${member.chineseName ? ` (${member.chineseName})` : ''}`;
  }

  // 获取角色显示名称
  getRoleDisplayName(roleId: string, roles: Role[]): string {
    const role = roles.find(r => r.id === roleId);
    if (!role) return roleId;
    return `${role.englishName} (${role.chineseName})`;
  }

  // 获取项目显示名称
  getProjectDisplayName(projectId: string, projects: Project[]): string {
    const project = projects.find(p => p.id === projectId);
    if (!project) return projectId;
    return `${project.englishName} (${project.chineseName})`;
  }

  // 获取场地显示名称
  getVenueDisplayName(venueId: string, venues: Venue[]): string {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return venueId;
    return venue.name;
  }
} 