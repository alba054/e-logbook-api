import { User } from "../../models/User";

export class UserService {
  private userModel: User;

  constructor() {
    this.userModel = new User();
  }

  async getUserByUsername(username: string) {
    return this.userModel.getUserByUsername(username);
  }

  async getUserByEmail(email: string) {
    return this.userModel.getUserByEmail(email);
  }
}
