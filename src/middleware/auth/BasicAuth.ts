import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { config } from "../../config/Config";
import { UnauthenticatedError } from "../../exceptions/httpError/UnauthenticatedError";
import { UserService } from "../../services/database/UserService";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import bcryptjs from "bcryptjs";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";

export class BasicAuthMiddleware {
  private static checkBasicAuth() {
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

  static authenticateAdmin() {
    return function (req: Request, res: Response, next: NextFunction) {
      BasicAuthMiddleware.checkBasicAuth()(req, res, () => {
        if (!res.locals.credential) {
          return next(new BadRequestError("provide credential"));
        }

        if (
          res.locals.credential.username === config.config.ADMIN_USERNAME &&
          res.locals.credential.password === config.config.ADMIN_PASSWORD
        ) {
          return next();
        }

        return next(new UnauthenticatedError("admin credential is incorrect"));
      });
    };
  }

  static authenticate() {
    return function (req: Request, res: Response, next: NextFunction) {
      BasicAuthMiddleware.checkBasicAuth()(req, res, async () => {
        if (!res.locals.credential) {
          return next(new BadRequestError("provide credential"));
        }

        const userService = new UserService();
        const user = await userService.getUserByUsername(
          res.locals.credential.username
        );

        if (!user) {
          return next(new NotFoundError("user's not found"));
        }

        const passwordIsCorrect = await bcryptjs.compare(
          res.locals.credential.password,
          user.password
        );

        if (!passwordIsCorrect) {
          return next(new UnauthenticatedError("password is incorrect"));
        }

        res.locals.user = {
          username: user.username,
          email: user.email,
          role: user.role,
          badges: user.badges.map((badge) => badge.name),
          studentId: user.studentId,
          userId: user.id,
          supervisorId: user.supervisorId,
        } as ITokenPayload;

        next();
      });
    };
  }
}
