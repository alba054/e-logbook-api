import { NextFunction, Request, Response } from "express";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { tokenGenerator } from "../../utils/auth/TokenGenerator";
import { config } from "../../config/Config";
import { UnauthorizedError } from "../../exceptions/httpError/UnauthorizedError";
import { constants } from "../../utils";

export class AuthorizationBearer {
  static authorize(roles: string[]) {
    return async function authorizationHandler(
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      const { authorization } = req.headers;
      const bearerSchema = authorization?.split(" ");

      if (!bearerSchema) {
        // todo: handler for authorization is not provided
        return next(new BadRequestError("Provide Authorization in header"));
      }

      if (bearerSchema[0] !== "Bearer") {
        // todo: handler for invalid schema (without Basic Prefix)
        return next(
          new BadRequestError('Invalid schema. provide "Bearer <token>"')
        );
      }

      if (!bearerSchema[1]) {
        // todo: handler for authorization credential is not provided
        return next(new BadRequestError("provide token"));
      }

      const token = bearerSchema[1];

      if (!config.config.ACCESS_SECRET_KEY) {
        return next(new InternalServerError());
      }

      try {
        const tokenPayload = await tokenGenerator.verify(
          token,
          config.config.ACCESS_SECRET_KEY,
          {
            issuer: config.config.TOKEN_ISSUER,
          }
        );

        if (!tokenPayload) {
          return next(new UnauthorizedError("provide token"));
        }

        if (
          tokenPayload.badges &&
          !roles.includes(tokenPayload.role) &&
          !tokenPayload.badges.some((e) => roles.includes(e))
        ) {
          return next(new UnauthorizedError("you cannot access this resource"));
        }

        res.locals.user = tokenPayload;

        next();
      } catch (error: any) {
        if (error instanceof TokenExpiredError) {
          return next(new BadRequestError(error.message));
        } else if (error instanceof JsonWebTokenError) {
          if (error.message === "invalid token") {
            // todo: BadRequestError with custom invalid token message
            return next(new BadRequestError(constants.INVALID_TOKEN));
          } else if (error.message === "jwt malformed") {
            // todo: BadRequestError with custom token malformed message
            return next(new BadRequestError(constants.MALFORMED_TOKEN));
          } else if (error.message === "jwt signature is required") {
            // todo: BadRequestError with custom required signature message
            return next(new BadRequestError(constants.SIGNATURE_REQUIRED));
          } else if (error.message === "invalid signature") {
            // todo: BadRequestError with custom invalid signature message
            return next(new BadRequestError(constants.INVALID_SIGNATURE));
          } else {
            return next(new BadRequestError(error.message));
          }
        }
      }
    };
  }
}
