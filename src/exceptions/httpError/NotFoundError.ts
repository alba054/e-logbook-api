import { WebError } from "./WebError";

export class NotFoundError extends WebError {
  constructor(message: string) {
    super("NotFoundError", 404, message);
  }
}
