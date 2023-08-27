export interface IHistoryInfo {
  readonly type: string;
  readonly studentName: string | null;
  readonly supervisorName: string | null;
  readonly timestamp: number;
  readonly patientName: string | null;
  readonly rating: number | null;
}
