export interface IListClinicalRecordDTO {
  id: string;
  studentName?: string;
  time?: string | Date;
  patientName?: string;
  studentId?: string;
  attachment?: string;
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
}

interface IExaminationClinicalRecordDetail {
  affectedPart: string;
  examinationType: string[];
}

interface IDiagnosesClinicalRecordDetail {
  affectedPart: string;
  diagnosesType: string[];
}

interface IManagementClinicalRecordDetail {
  affectedPart: string;
  management: {
    managementType: string;
    managementRole: string;
  };
}
