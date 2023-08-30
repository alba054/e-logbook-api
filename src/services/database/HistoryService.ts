import { History } from "../../models/History";
import {
  History as HistoryDBObject,
  Student,
  Supervisor,
} from "@prisma/client";
import { IHistoryInfo } from "../../utils/interfaces/HistoryInfo";
import { ClinicalRecord } from "../../models/ClinicalRecord";
import { createErrorObject } from "../../utils";

export class HistoryService {
  private historyModel: History;
  private clinicalRecordModel: ClinicalRecord;

  constructor() {
    this.historyModel = new History();
    this.clinicalRecordModel = new ClinicalRecord();
  }

  async retrieveHistoryBySupervisors(
    supervisorId: string[],
    page: number = 0,
    elemPerPage?: number,
    checkIn?: any
  ) {
    const history = await this.historyModel.getHistoryBySupervisors(
      supervisorId,
      page,
      elemPerPage,
      checkIn
    );

    if (history && "error" in history) {
      return createErrorObject(500, history.message);
    }

    return await Promise.all(history.map(this.processHistoryResult));
  }

  async retrieveHistoryByStudents(
    studentId: string[],
    page: number = 0,
    elemPerPage?: number,
    checkIn?: any
  ) {
    const history = await this.historyModel.getHistoryByStudents(
      studentId,
      page,
      elemPerPage
    );

    if (history && "error" in history) {
      return createErrorObject(500, history.message);
    }

    return await Promise.all(history.map(this.processHistoryResult));
  }

  async retrieveHistory(page: number = 0, elemPerPage?: number, checkIn?: any) {
    const history = await this.historyModel.getHistory(
      page,
      elemPerPage,
      checkIn
    );

    if (history && "error" in history) {
      return createErrorObject(500, history.message);
    }

    return await Promise.all(history.map(this.processHistoryResult));
  }

  async processHistoryResult(
    value: HistoryDBObject & {
      student: Student | null;
      supervisor: Supervisor | null;
    }
  ) {
    let patientName: string | null = null;
    let rating: number | null = null;
    if (value.type == "CLINICAL_RECORD" && value.attachment) {
      // get patient name
      try {
        const clinicalRecord =
          await this.clinicalRecordModel.getClinicalRecordsById(
            value.attachment
          );
        patientName = clinicalRecord?.patientName ?? null;
        rating = clinicalRecord?.rating ?? null;
      } catch (error) {
        // ignore error for now
      }
    }

    return {
      type: History.getHistoryName(value.type),
      studentName: value.student?.fullName ?? null,
      supervisorName: value.supervisor?.fullname ?? null,
      timestamp: Number(value.timestamp),
      patientName: patientName,
      rating: rating,
      attachment: value.attachment,
      studentId: value.student?.studentId,
    } as IHistoryInfo;
  }
}
