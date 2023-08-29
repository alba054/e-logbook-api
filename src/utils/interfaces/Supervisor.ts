export interface IPostSupervisorPayload {
  readonly username: string;
  readonly password: string;
  readonly supervisorId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly badges?: number[];
  readonly roles: "DPK" | "SUPERVISOR" | "ER";
}

export interface IPostSupervisorBadgePayload {
  readonly supervisorId: string;
  readonly badges?: number[];
}
