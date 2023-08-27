export interface IHistoryInfo {
  readonly type: string;
  readonly studentName: string;
  readonly supervisorName: string;
  readonly timestamp: number;
  readonly patientName: string|null;
  readonly rating: number|null;
}
