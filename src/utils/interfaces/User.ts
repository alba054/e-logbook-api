export interface IPostUserPayload {
  readonly username: string;
  readonly password: string;
  readonly role: "ADMIN";
}

export interface IPutUserProfile {
  readonly username?: string;
  readonly nim?: string;
  readonly email?: string;
  readonly pic?: string;
  readonly fullname?: string;
  readonly password?: string;
}

export interface IPutUserMasterData {
  readonly password: string;
  readonly email: string;
  readonly badges: number[];
  readonly address: string;
  readonly fullName: string;
  readonly gender: "MALE" | "FEMALE";
  readonly placeOfBirth: string;
  readonly dateOfBirth: number;
}
