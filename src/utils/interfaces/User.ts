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
}
