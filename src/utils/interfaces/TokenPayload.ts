export interface ITokenPayload {
  readonly username: string;
  readonly email?: string;
  readonly role: "SUPERVISOR" | "STUDENT";
  readonly badges?: string[];
  readonly studentId?: string;
  readonly supervisorId?: string;
  readonly userId: string;
}
