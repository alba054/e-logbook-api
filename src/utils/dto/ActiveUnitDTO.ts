export interface IActiveUnitDTO {
  unitId: string;
  unitName: string;
  checkInStatus: "VERIFIED" | "INPROCESS" | "UNVERIFIED";
  checkOutStatus: "VERIFIED" | "INPROCESS" | "UNVERIFIED";
}
