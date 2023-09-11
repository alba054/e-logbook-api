export interface IPostStudentPayload {
  readonly username: string;
  readonly password: string;
  readonly studentId: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly address?: string;
  readonly dateOfBirth?: number;
  readonly placeOfBirth?: string;
  readonly gender?: "MALE" | "FEMALE";
}

export interface IPutStudentData {
  readonly clinicId?: string;
  readonly preclinicId?: string;
  readonly graduationDate?: number;
  readonly phoneNumber?: string;
  readonly address?: string;
  readonly academicSupervisor?: string;
  readonly supervisingDPK?: string;
  readonly examinerDPK?: string;
  readonly rsStation?: string;
  readonly pkmStation?: string;
  readonly periodLengthStation?: number;
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

export interface IPutStudentSupervisor {
  readonly supervisorIds: string[];
}
