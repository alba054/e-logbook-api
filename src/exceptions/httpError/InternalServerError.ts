import { WebError } from "./WebError";

export class InternalServerError extends WebError {
  constructor(message: string = "Internal Error :(") {
    super("InternalServerError", 500, message);
  }
}
