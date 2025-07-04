export interface Role {
  id: string;
  name: string;
  category: 'speaking' | 'evaluation' | 'leadership' | 'functional';
  description?: string;
  isSpeechRole: boolean; // 是否为演讲角色
  order: number; // 会议中的顺序
}

// 预定义的角色
export const DEFAULT_ROLES: Role[] = [
  { id: 'toastmaster', name: '会议主持人', category: 'leadership', isSpeechRole: false, order: 1 },
  { id: 'speaker1', name: '演讲者1', category: 'speaking', isSpeechRole: true, order: 2 },
  { id: 'speaker2', name: '演讲者2', category: 'speaking', isSpeechRole: true, order: 3 },
  { id: 'speaker3', name: '演讲者3', category: 'speaking', isSpeechRole: true, order: 4 },
  { id: 'evaluator1', name: '点评员1', category: 'evaluation', isSpeechRole: false, order: 5 },
  { id: 'evaluator2', name: '点评员2', category: 'evaluation', isSpeechRole: false, order: 6 },
  { id: 'evaluator3', name: '点评员3', category: 'evaluation', isSpeechRole: false, order: 7 },
  { id: 'general-evaluator', name: '总点评员', category: 'evaluation', isSpeechRole: false, order: 8 },
  { id: 'table-topics-master', name: '即兴演讲主持人', category: 'leadership', isSpeechRole: false, order: 9 },
  { id: 'timer', name: '计时员', category: 'functional', isSpeechRole: false, order: 10 },
  { id: 'ah-counter', name: '语法官', category: 'functional', isSpeechRole: false, order: 11 },
  { id: 'grammarian', name: '用词官', category: 'functional', isSpeechRole: false, order: 12 }
]; 