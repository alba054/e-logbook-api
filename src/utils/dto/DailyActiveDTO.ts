export interface IListActivitiesPerWeek {
  weekName: number;
  attend: number;
  alpha: number;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  activities: IActivitiesDetail[];
}

export interface IActivitiesDetail {
  id?: string;
  day: string;
  location?: string;
  detail?: string;
  activityStatus: "SICK" | "ATTEND" | "NOT_ATTEND";
  activityName?: string;
  verificationStatus?: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
}

export interface IStudentDailyActivities {
  unitName?: string;
  inprocessDailyActivity?: number;
  verifiedDailyActivity?: number;
  unverifiedDailyActivity?: number;
  weeks: {
    weekName: number;
    unitId: string;
    unitName: string;
    startDate: number;
    endDate: number;
  }[];
  dailyActivities: IDailyActivities[];
}

export interface ISubmittedActivities {
  studentName: string;
  latest: Date | string;
  studentId: string;
}

interface IDailyActivities {
  attendNum?: number;
  notAttendNum?: number;
  sickNum?: number;
  dailyActivityId: string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  weekName: number;
  activitiesStatus: IActivitiesDetail[];
}
