export interface IStudentWeeklyAssesment {
  studentName: string;
  studentId: string;
  assesments: IWeeklyAssesment[];
}

interface IWeeklyAssesment {
  id: string;
  weekNum: number;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  attendNum: number;
  notAttendNum: number;
  score: number;
}
