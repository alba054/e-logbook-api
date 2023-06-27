import db from "../database";

export class User {
  constructor() {}

  async getUserByUsername(username: string) {
    return db.user.findUnique({
      where: { username },
      include: { badges: true, student: true },
    });
  }

  async getUserByEmail(email: string) {
    return db.user.findUnique({
      where: {
        email,
      },
    });
  }
}
