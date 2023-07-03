export interface IListInProcessCheckInDTO {
  fullname: string;
  studentId: string;
  unitName: string;
  unitId: string;
  checkInTime: number;
  checkInStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
}
