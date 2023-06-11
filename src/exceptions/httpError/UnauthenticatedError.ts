import { WebError } from "./WebError";

export class UnauthenticatedError extends WebError {
  constructor(message: string) {
    super("UnauthenticatedError", 401, message);
  }
}
