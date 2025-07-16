//场地接口
export interface Venue {
  id: string;
  name: string;
  address: string;
  state: 'available' | 'unavailable' | 'unknown';
  owner: string;
}