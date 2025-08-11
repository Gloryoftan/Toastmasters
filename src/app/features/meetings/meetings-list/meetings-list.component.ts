import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { DataService } from '../../../core/services/data.service';
import { Meeting } from '../../../core/models/meeting.model';
import { Venue } from '../../../core/models/venue.model';

interface MeetingListView extends Meeting {
  venueName: string;
  typeText: string;
  assignmentCount: number;
  visitorCount: number;
  speechCount: number;
}

@Component({
  selector: 'app-meetings-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './meetings-list.component.html',
  styleUrls: ['./meetings-list.component.scss']
})
export class MeetingsListComponent implements OnInit {
  meetingsView$: Observable<MeetingListView[]>;

  constructor(private dataService: DataService) {
    this.meetingsView$ = combineLatest([
      this.dataService.getMeetings(),
      this.dataService.getVenues()
    ]).pipe(
      map(([meetings, venues]) => {
        return meetings.map(meeting => {
          const venue = venues.find(v => v.id === meeting.venue);
          return {
            ...meeting,
            venueName: venue ? venue.name : meeting.venue,
            typeText: this.getTypeText(meeting.type),
            assignmentCount: meeting.assignments.length,
            visitorCount: meeting.visitors.length,
            speechCount: meeting.speeches.length
          } as MeetingListView;
        }).sort((a, b) => b.date.getTime() - a.date.getTime()); // 按日期倒序排序
      })
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
      'training': '培训会议',
      'joint': '联合会议'
    };
    return typeMap[type] || type;
  }
}
 