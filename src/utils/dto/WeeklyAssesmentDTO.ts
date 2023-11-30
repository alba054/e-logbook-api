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

export interface IActivityDetail {
  day: string | any;
  createdAt?: number | any;
  activityStatus: "SICK" | "ATTEND" | "NOT_ATTEND" | "HOLIDAY" | any;
  weekId: string;
}
