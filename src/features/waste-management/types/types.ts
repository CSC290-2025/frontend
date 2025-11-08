// Types
export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'Available' | 'Full';
}

export interface WasteData {
  year: number;
  value: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  image: string;
  postedBy: string;
  postedDate: string;
}

export interface WasteTrend {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}
