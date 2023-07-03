export interface IPostSupervisorPayload {
  readonly username: string;
  readonly password: string;
  readonly supervisorId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface IPostSupervisorBadgePayload {
  readonly supervisorId: string;
  readonly badges: number[];
}
