import { ScientificRole } from "../../models/ScientificRole";
import { IPostScientificRolePayload } from "../../utils/interfaces/ScientificRole";

export class ScientificRoleService {
  private scientificRoleModel: ScientificRole;

  constructor() {
    this.scientificRoleModel = new ScientificRole();
  }

  async insertScientificRole(payload: IPostScientificRolePayload) {
    return this.scientificRoleModel.insertScientificRole(payload);
  }

  async getScientificRoles() {
    return this.scientificRoleModel.getScientificRoles();
  }
}
