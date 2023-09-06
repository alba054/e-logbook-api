export interface IPostClinicalRecord {
  readonly patientName: string;
  readonly patientAge: number;
  readonly gender: "FEMALE" | "MALE";
  readonly notes?: string;
  readonly recordId: string;
  readonly attachment?: string;
  readonly studentFeedback?: string;
  readonly examinations: ClinicalRecordExamination[];
  readonly diagnosiss: ClinicalRecordDiagnosis[];
  readonly managements: ClinicalRecordManagement[];
  readonly supervisorId: string;
}

export interface IPutVerificationStatusClinicalRecord {
  readonly verified: boolean;
  readonly supervisorFeedback?: string;
  readonly rating?: number;
}

export interface IPutFeedbackClinicalRecord {
  readonly feedback: string;
}

interface ClinicalRecordExamination {
  examinationTypeId: string[];
}

interface ClinicalRecordDiagnosis {
  diagnosisTypeId: string[];
}

interface ClinicalRecordManagement {
  management: [
    {
      managementTypeId: string;
      managementRoleId: string;
    }
  ];
}
