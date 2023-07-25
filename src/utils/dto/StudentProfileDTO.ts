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
  supervisingDPKName?: string;
  examinerDPKName?: string;
}
