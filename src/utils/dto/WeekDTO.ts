export interface IListWeek {
  id: string;
  weekName: number;
  unitId: string;
  unitName: string;
  startDate: number;
  endDate: number;
  days: IListDay[];
}

interface IListDay {
  day: string;
  id: string;
}
