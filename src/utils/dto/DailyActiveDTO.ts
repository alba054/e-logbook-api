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
  id?: string | any;
  day: string | any;
  location?: string | any;
  detail?: string | any;
  activityStatus: "SICK" | "ATTEND" | "NOT_ATTEND" | "HOLIDAY" | any;
  activityName?: string | any;
  verificationStatus?: "INPROCESS" | "VERIFIED" | "UNVERIFIED" | any;
  supervisorId?: string | any;
  supervisorName?: string | any;
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
    status: boolean;
    unitName: string;
    startDate: number;
    endDate: number;
    days: {
      day: string;
      id: string;
    }[];
  }[];
  dailyActivities: IDailyActivities[];
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

export interface IDailyActivities {
  attendNum?: number | any;
  notAttendNum?: number | any;
  sickNum?: number | any;
  dailyActivityId: string | any;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED" | any;
  weekId?: string | any;
  weekName?: string | any;
  activitiesStatus: IActivitiesDetail[];
}
