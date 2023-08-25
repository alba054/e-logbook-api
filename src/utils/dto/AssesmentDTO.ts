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

interface IMiniCexGradeItem {
  name: string;
  score: number;
  id: number;
}
