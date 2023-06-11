import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";

export class BasicAuthMiddleware {
  static checkBasicAuth() {
    return function (req: Request, res: Response, next: NextFunction) {
      const { authorization } = req.headers;
      const basicSchema = authorization?.split(" ");

      if (!basicSchema) {
        // todo: handler for authorization is not provided
        return next(new BadRequestError("Provide Authorization in header"));
      }

      if (basicSchema[0] !== "Basic") {
        // todo: handler for invalid schema (without Basic Prefix)
        return next(
          new BadRequestError('Invalid schema. provide "Basic <credential>"')
        );
      }

      if (!basicSchema[1]) {
        // todo: handler for authorization credential is not provided
        return next(new BadRequestError("provide credential"));
      }

      // todo: decode provided base64 credential
      let providedCredential = Buffer.from(basicSchema[1], "base64").toString(
        "utf-8"
      );

      const username = providedCredential.split(":")[0];
      const password = providedCredential.split(":")[1];

      if (!username || !password) {
        // todo: handler for username or password is not provided
        return next(
          new BadRequestError(
            "provide credential in <username:password> format. encode it in base64"
          )
        );
      }

      res.locals.credential = { username, password };
      next();
    };
  }
}
