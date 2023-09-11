export interface IListClinicalRecordDTO {
  id: string;
  studentName?: string;
  time?: string | Date;
  patientName?: string;
  studentId?: string;
  attachment?: string;
  status: "VERIFIED" | "UNVERIFIED" | "INPROCESS";
  pages?: number;
  unitName?: string;
  rating: number;
  notes?: string;
}

export interface IClinicalRecordDetailDTO {
  studentName?: string;
  supervisorName?: string;
  patientName?: string;
  patientSex?: "MALE" | "FEMALE";
  examinations?: IExaminationClinicalRecordDetail[];
  diagnosess?: IDiagnosesClinicalRecordDetail[];
  managements?: IManagementClinicalRecordDetail[];
  attachments?: string;
  studentFeedback?: string;
  supervisorFeedback?: string;
  filename?: string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  recordId?: string;
  unit?: string;
  rating: number;
  notes?: string;
}

export interface IStudentClinicalRecods {
  verifiedCounts: number;
  unverifiedCounts: number;
  listClinicalRecords: IListStudentClinicalRecordsDTO[];
}

interface IListStudentClinicalRecordsDTO {
  supervisorName: string;
  patientName: string;
  verificationStatus: "VERIFIED" | "INPROCESS" | "UNVERIFIED";
  clinicalRecordId: string;
  rating: number;
  notes?: string;
}

interface IExaminationClinicalRecordDetail {
  examinationType: string[];
}

interface IDiagnosesClinicalRecordDetail {
  diagnosesType: string[];
}

interface IManagementClinicalRecordDetail {
  management: {
    managementType: string;
    managementRole: string;
  }[];
}
