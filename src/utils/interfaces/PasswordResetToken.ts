export interface IPasswordResetTokenData {
  readonly username: string;
  readonly token: string;
  readonly otp: string;
}
