export interface IPutDailyActivityActivity {
  activityStatus: "SICK" | "ATTEND" | "NOT_ATTEND";
  detail?: string;
  supervisorId: string;
  locationId: number;
  activityNameId: number;
}

export interface IPutDailyActivityVerificationStatus {
  readonly verified: boolean;
}
