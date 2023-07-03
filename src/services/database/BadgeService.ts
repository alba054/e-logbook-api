import { Badge } from "../../models/Badge";

export class BadgeService {
  private badgeModel: Badge;

  constructor() {
    this.badgeModel = new Badge();
  }

  async getAllBadges() {
    return this.badgeModel.getAllBadges();
  }
}
