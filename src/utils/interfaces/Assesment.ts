export interface IPostMiniCex {
  location: number;
  case: string;
}

export interface IPutGradeItemMiniCex {
  name: string;
}

export interface IPutGradeItemMiniCexScore {
  scores: {
    score: number;
    id: number;
  }[];
}

export interface IPutGradeItemMiniCexScoreV2 {
  scores: {
    score: number;
    name: string;
  }[];
}
export interface IPutGradeItemPersonalBehaviourVerificationStatus {
  id: number;
  verified: boolean;
}

export interface IPutStudentAssesmentScore {
  type:
    | "OSCE"
    | "CBT"
    | "PERSONAL_BEHAVIOUR"
    | "MINI_CEX"
    | "SCIENTIFIC_ASSESMENT";
  score: number;
}
