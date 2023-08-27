export interface IListMiniCex {
  case: string;
  location: string;
  studentId: string;
  id: string;
  studentName: string;
}

export interface IMiniCexDetail {
  case: string;
  location: string;
  studentId: string;
  studentName: string;
  id: string;
  grade: number;
  scores: IMiniCexGradeItem[];
}

export interface IListScientificAssesment {
  studentId: string;
  id: string;
  studentName: string;
}

export interface IScientificAssesmentDetail {
  studentId: string;
  studentName: string;
  id: string;
  grade: number;
  scores: IMiniCexGradeItem[];
}
export interface IPersonalBehaviourDetail {
  studentId: string;
  studentName: string;
  id: string;
  scores: IPersonalBehaviourGradeItem[];
}

export interface IListStudentAssesment {
  studentName: string;
  studentId: string;
  unitName: string;
  unitId: string;
}

export interface IStudentAssesmentUnit {
  unitName: string;
  type:
    | "MINI_CEX"
    | "SCIENTIFIC_ASSESMENT"
    | "PERSONAL_BEHAVIOUR"
    | "OSCE"
    | "CBT";
  score: number;
  weight: number;
}

interface IMiniCexGradeItem {
  name: string;
  score: number;
  id: number;
}

interface IPersonalBehaviourGradeItem {
  name: string;
  verificationStatus: "INPROCESS" | "UNVERIFIED" | "VERIFIED";
  id: number;
  type:
    | "ALTRUISM"
    | "HONOR_INTEGRITY"
    | "CARING_COMPASSION"
    | "RESPECT"
    | "RESPONSIBILITY"
    | "ACCOUNTABILITY"
    | "EXCELLENCE_SCHOLARSHIP"
    | "LEADERSHIP";
}
