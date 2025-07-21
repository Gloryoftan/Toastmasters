export interface PastOfficer {
  id: string;
  term: string;
  termYear: string;
  startDate: string;
  endDate: string;
  officers: Officer[];
}

export interface Officer {
  officeId: string;
  memberId: string;
}