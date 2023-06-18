export interface IPostStudentPayload {
  readonly username: string;
  readonly password: string;
  readonly studentId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface IPostStudentResetPasswordPayload {
  readonly otp: string;
  readonly newPassword: string;
}

export interface IPutStudentActiveUnit {
  readonly unitId: string;
}

export interface IPostStudentTokenResetPassword {
  readonly email: string;
}
