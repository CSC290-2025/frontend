export interface TrafficSignal {
  duration: number;
  color: 'red' | 'yellow' | 'green';
  intersectionId: string;
}
