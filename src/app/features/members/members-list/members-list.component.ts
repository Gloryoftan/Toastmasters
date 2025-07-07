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
} 