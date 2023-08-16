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

interface IListCaseDTO {
  caseId: string;
  caseTypeId: number;
  caseName: string;
  caseType: "OBSERVED" | "DISCUSSED" | "OBTAINED";
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
}
