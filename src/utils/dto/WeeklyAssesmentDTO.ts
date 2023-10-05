export interface IStudentWeeklyAssesment {
  studentName: string;
  studentId: string;
  unitName: string;
  assesments: IWeeklyAssesment[];
}

export interface IWeeklyAssesment {
  id: string;
  weekNum: number;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  attendNum: number;
  notAttendNum: number;
  startDate: number | null;
  endDate: number | null;
  score: number;
}
