import { PersonalBehaviourGradeItem } from "../../models/PersonalBehaviourGradeItem";
import { IPostPersonalBehaviourGradeItemPayload } from "../../utils/interfaces/PersonalBehaviourGradeItem";

export class PersonalBehaviourGradeItemService {
  private personalBehaviourGradeItemModel: PersonalBehaviourGradeItem;

  constructor() {
    this.personalBehaviourGradeItemModel = new PersonalBehaviourGradeItem();
  }

  async deletePersonalBehaviourGradeItemById(id: number) {
    return this.personalBehaviourGradeItemModel.deletePersonalBehaviourGradeItem(
      id
    );
  }

  async insertPersonalBehaviourGradeItemsUnit(
    payload: IPostPersonalBehaviourGradeItemPayload
  ) {
    return this.personalBehaviourGradeItemModel.insertPersonalBehaviourGradeItemByUnitId(
      payload
    );
  }

  async getPersonalBehaviourGradeItemByUnitId() {
    return this.personalBehaviourGradeItemModel.getPersonalBehaviourGradeItemsByUnitId();
  }
}
