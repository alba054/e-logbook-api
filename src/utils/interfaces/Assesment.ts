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
