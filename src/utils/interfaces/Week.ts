export interface IPostWeek {
  weekNum: number;
  unitId: string;
  startDate: number;
  endDate: number;
}

export interface IPutWeek {
  weekNum?: number;
  startDate?: number;
  endDate?: number;
}
