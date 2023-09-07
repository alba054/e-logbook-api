export interface IStudentSelfReflections {
  studentName: string;
  studentId: string;
  listSelfReflections: IListSelfReflectionDTO[];
}

export interface ISubmittedSelfReflections {
  studentName: string;
  latest: Date | string;
  studentId: string;
  unitName?: string;
}

export interface ISelfReflectionDetailDTO {
  studentName: string;
  content: string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  selfReflectionId: string;
  studentId: string;
}

interface IListSelfReflectionDTO {
  selfReflectionId: string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  content: string;
}
