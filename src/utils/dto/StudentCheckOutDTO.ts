export interface IListInProcessCheckOutDTO {
  fullname: string;
  studentId: string;
  unitName: string;
  unitId: string;
  checkOutTime: number;
  checkOutStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
}
