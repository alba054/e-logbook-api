import { WebError } from "./WebError";

export class UnauthorizedError extends WebError {
  constructor(message: string) {
    super("UnauthorizedError", 403, message);
  }
}
