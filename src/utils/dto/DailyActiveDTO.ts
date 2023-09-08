export interface IListActivitiesPerWeek {
  weekName: number;
  attend: number;
  alpha: number;
  days: {
    day: string;
    id: string;
  }[];
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  activities: IActivitiesDetail[];
}

export interface IActivitiesDetail {
  id?: string;
  day: string;
  location?: string;
  detail?: string;
  activityStatus: "SICK" | "ATTEND" | "NOT_ATTEND" | "HOLIDAY";
  activityName?: string;
  verificationStatus?: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
}

export interface IStudentDailyActivities {
  unitName?: string;
  inprocessDailyActivity?: number;
  verifiedDailyActivity?: number;
  unverifiedDailyActivity?: number;
  weeks: {
    id: string;
    weekName: number;
    unitId: string;
    unitName: string;
    startDate: number;
    endDate: number;
  }[];
  dailyActivities: IDailyActivities[];
  temp: any;
}

export interface ISubmittedActivities {
  studentName: string;
  latest: Date | string;
  studentId: string;
}

export interface IListActivities {
  studentName: string;
  studentId: string;
  createdAt: string | Date;
  id: string;
  unitName: string;
  activityName: string;
  location: string;
  activityStatus: string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  weekNum: number;
  day: string;
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
