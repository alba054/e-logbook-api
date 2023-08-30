export interface IStudentProblemConsultations {
  studentName: string;
  studentId: string;
  listProblemConsultations: IListProblemConsultationDTO[];
}

export interface ISubmittedProblemConsultations {
  studentName: string;
  latest: Date | string;
  studentId: string;
}

export interface IProblemConsultationDetailDTO {
  studentName: string;
  content: string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  ProblemConsultationId: string;
  studentId: string;
  solution: string;
}

interface IListProblemConsultationDTO {
  problemConsultationId: string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  solution: string;
  content: string;
  studentName?: string;
  studentId?: string;
}
