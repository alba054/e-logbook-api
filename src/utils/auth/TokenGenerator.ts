import jwt, {
  GetPublicKeyOrSecret,
  JwtPayload,
  Secret,
  SignOptions,
  VerifyOptions,
} from "jsonwebtoken";
import dotenv from "dotenv";
import { ITokenPayload } from "../interfaces/TokenPayload";

dotenv.config();

class TokenGenerator {
  options: any;
  constructor() {}

  sign(
    payload: Buffer | string | object,
    secretKey: Secret,
    options?: SignOptions
  ): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        secretKey,
        options ?? {},
        (err: any, encoded: string | undefined) => {
          if (err) {
            reject(err);
          } else {
            resolve(encoded);
          }
        }
      );
    });
  }

  verify(
    token: string,
    secretKey: Secret | GetPublicKeyOrSecret,
    options: VerifyOptions
  ): Promise<ITokenPayload | undefined> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secretKey, options, (err: any, decoded: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }
  decode(token: string): ITokenPayload | string | JwtPayload | null {
    return jwt.decode(token);
  }
}

export const tokenGenerator = new TokenGenerator();
