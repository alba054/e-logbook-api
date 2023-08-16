export interface IStudentProfileDTO {
  studentId: string;
  clinicId?: string;
  preClinicId?: string;
  graduationDate?: number;
  phoneNumber?: string;
  address?: string;
  fullName?: string;
  checkInStatus: "VERIFIED" | "INPROCESS" | "UNVERIFIED";
  checkOutStatus: "VERIFIED" | "INPROCESS" | "UNVERIFIED";
  academicSupervisorName?: string;
  academicSupervisorId?: string;
  supervisingDPKName?: string;
  supervisingDPKId?: string;
  examinerDPKName?: string;
  examinerDPKId?: string;
  rsStation?: string;
  pkmStation?: string;
  periodLengthStation?: number;
}
