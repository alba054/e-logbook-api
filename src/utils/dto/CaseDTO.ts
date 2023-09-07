export interface ISubmittedCase {
  studentName: string;
  latest: Date | string;
  studentId: string;
}

export interface IStudentCases {
  studentName: string;
  studentId: string;
  listCases: IListCaseDTO[];
}

export interface IListCaseDTO {
  caseId: string;
  caseTypeId: number;
  caseName: string;
  caseType: "DISCUSSED" | "OBTAINED";
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
}
