export interface IPostStudentPayload {
  readonly username: string;
  readonly password: string;
  readonly studentId: string;
  readonly email?: string;
}

export interface IPostStudentResetPasswordPayload {
  readonly otp: string;
  readonly newPassword: string;
}
