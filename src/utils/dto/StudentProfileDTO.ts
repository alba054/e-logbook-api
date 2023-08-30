export interface IStudentProfileDTO {
  studentId: string;
  clinicId?: string;
  preClinicId?: string;
  graduationDate?: number;
  phoneNumber?: string;
  address?: string;
  fullName?: string;
  checkInStatus?: "VERIFIED" | "INPROCESS" | "UNVERIFIED";
  checkOutStatus?: "VERIFIED" | "INPROCESS" | "UNVERIFIED";
  academicSupervisorName?: string;
  academicSupervisorId?: string;
  academicSupervisorUserId?: string;
  supervisingDPKName?: string;
  supervisingDPKId?: string;
  supervisingDPKUserId?: string;
  examinerDPKName?: string;
  examinerDPKId?: string;
  examinerDPKUserId?: string;
  rsStation?: string;
  pkmStation?: string;
  periodLengthStation?: number;
  email?: string;
  userId?: string;
}
