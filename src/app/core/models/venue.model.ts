//场地接口
export interface Venue {
  id: string;
  name: string;
  address: string;
  status: 'available' | 'unavailable' | 'unknown';
  owner: string;
}