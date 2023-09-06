export interface IPostSupervisorPayload {
  readonly username: string;
  readonly password: string;
  readonly supervisorId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly badges?: number[];
  readonly roles: "DPK" | "SUPERVISOR" | "ER";
  readonly address?: string;
  readonly dateOfBirth?: number;
  readonly placeOfBirth?: string;
  readonly gender?: "MALE" | "FEMALE";
  readonly location?: number[];
  readonly units?: string[];
}

export interface IPostSupervisorBadgePayload {
  readonly supervisorId: string;
  readonly badges?: number[];
}
