export interface ITokenPayload {
  readonly username: string;
  readonly email?: string;
  readonly role: "SUPERVISOR" | "STUDENT" | "ER" | "DPK" | "ADMIN";
  readonly badges?: string[];
  readonly studentId?: string;
  readonly supervisorId?: string;
  readonly userId: string;
}
