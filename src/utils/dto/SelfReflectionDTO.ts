export interface IStudentSelfReflections {
  studentName: string;
  studentId: string;
  listSelfReflections: IListSelfReflectionDTO[];
}

interface IListSelfReflectionDTO {
  selfReflectionId: string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  content: string;
}
