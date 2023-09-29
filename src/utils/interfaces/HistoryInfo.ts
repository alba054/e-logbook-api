export interface IHistoryInfo {
  readonly type: string;
  readonly studentName: string | null;
  readonly supervisorName: string | null;
  readonly supervisorId: string | null;
  readonly timestamp: number;
  readonly patientName: string | null;
  readonly rating: number | null;
  readonly attachment: string | null | undefined;
  readonly studentId: string | null | undefined;
  readonly unitName: string | null | undefined;
  readonly unitId: string | null | undefined;
}
