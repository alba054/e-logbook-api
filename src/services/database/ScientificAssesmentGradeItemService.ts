import { ScientificAssesmentGradeItem } from "../../models/ScientificAssesmentGradeItem";
import { IPostScientificAssesmentGradeItemPayload } from "../../utils/interfaces/ScientificAssesmentGradeItem";

export class ScientificAssesmentGradeItemService {
  private scientificAssesmentGradeItemModel: ScientificAssesmentGradeItem;

  constructor() {
    this.scientificAssesmentGradeItemModel = new ScientificAssesmentGradeItem();
  }

  async deleteScientificAssesmentGradeItemById(id: number) {
    return this.scientificAssesmentGradeItemModel.deleteScientificAssesmentGradeItem(
      id
    );
  }

  async insertScientificAssesmentGradeItemsUnit(
    payload: IPostScientificAssesmentGradeItemPayload
  ) {
    return this.scientificAssesmentGradeItemModel.insertScientificAssesmentGradeItemByUnitId(
      payload
    );
  }

  async getScientificAssesmentGradeItemByUnitId() {
    return this.scientificAssesmentGradeItemModel.getScientificAssesmentGradeItemsByUnitId();
  }
}
