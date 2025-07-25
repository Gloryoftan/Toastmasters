import { Routes } from '@angular/router';

export const MEETINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./meetings-list/meetings-list.component').then(m => m.MeetingsListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./meeting-editor/meeting-editor.component').then(m => m.MeetingEditorComponent)
  },
  {
    path: 'roles-manager',
    loadComponent: () => import('./meeting-roles-manager/meeting-roles-manager.component').then(m => m.MeetingRolesManagerComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./meeting-editor/meeting-editor.component').then(m => m.MeetingEditorComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./meeting-detail/meeting-detail.component').then(m => m.MeetingDetailComponent)
  }
]; 