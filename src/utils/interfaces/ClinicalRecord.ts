export interface IPostClinicalRecord {
  patientName: string;
  patientAge: number;
  gender: "FEMALE" | "MALE";
  notes?: string;
  recordId: string;
  attachment?: string;
  studentFeedback?: string;
  examinations: ClinicalRecordExamination[];
  diagnosiss: ClinicalRecordDiagnosis[];
  managements: ClinicalRecordManagement[];
}

interface ClinicalRecordExamination {
  affectedPartId: string;
  examinationTypeId: string[];
}

interface ClinicalRecordDiagnosis {
  affectedPartId: string;
  diagnosisTypeId: string[];
}

interface ClinicalRecordManagement {
  affectedPartId: string;
  management: [
    {
      managementTypeId: string;
      managementRoleId: string;
    }
  ];
}
