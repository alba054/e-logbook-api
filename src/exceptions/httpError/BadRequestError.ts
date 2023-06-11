import { WebError } from "./WebError";

export class BadRequestError extends WebError {
  constructor(message: string) {
    super("BadRequestError", 400, message);
  }
}
