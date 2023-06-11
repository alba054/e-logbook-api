import { NextFunction, Request, Response } from "express";
import { WebError } from "../../exceptions/httpError/WebError";
import { createResponse } from "../../utils";

export const ErrorHandler = async (
  err: WebError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ERROR_CODE = !(err instanceof WebError) ? 500 : err.statusCode;

  console.error(err);

  return res
    .status(ERROR_CODE)
    .json(createResponse(err.name, err.message + "\n\n"));
};
