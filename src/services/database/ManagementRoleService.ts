import { ManagementRole } from "../../models/ManagementRole";
import { IPostManagementRolePayload } from "../../utils/interfaces/ManagementRole";
import { v4 as uuidv4 } from "uuid";

export class ManagementRoleService {
  private managementRoleModel: ManagementRole;

  constructor() {
    this.managementRoleModel = new ManagementRole();
  }

  async deleteManagementRoleById(id: string) {
    return this.managementRoleModel.deleteManagementRole(id);
  }

  async insertManagementRolesUnit(payload: IPostManagementRolePayload) {
    return this.managementRoleModel.insertManagementRoleByUnitId(
      uuidv4(),
      payload
    );
  }

  async getManagementRoleByUnitId() {
    return this.managementRoleModel.getManagementRolesByUnitId();
  }
}
