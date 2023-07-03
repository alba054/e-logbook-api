import db from "../database";

export class Badge {
  async getAllBadges() {
    return db.badge.findMany();
  }
}
