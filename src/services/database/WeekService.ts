import { Week } from "../../models/Week";
import { IPostWeek, IPutWeek } from "../../utils/interfaces/Week";
import { v4 as uuidv4 } from "uuid";
import { createErrorObject, generateDay } from "../../utils";
import { Day } from "../../models/Day";
import db from "../../database";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class WeekService {
  private weekModel: Week;
  private dayModel: Day;

  constructor() {
    this.weekModel = new Week();
    this.dayModel = new Day();
  }
  async updateWeekStatus(id: string, status: boolean) {
    const week = await this.weekModel.getWeeksById(id);

    if (!week) {
      return createErrorObject(404, "week's not found");
    }

    return this.weekModel.updateWeekStatusById(id, status);
  }

  async deleteWeek(id: string) {
    const week = this.weekModel.getWeeksById(id);

    if (!week) {
      return createErrorObject(404, "week's not found");
    }

    return db.$transaction([
      db.day.deleteMany({
        where: {
          weekId: id,
        },
      }),
      db.week.delete({
        where: { id },
      }),
    ]);
  }

  async editWeek(id: string, payload: IPutWeek) {
    try {
      const generatedDays = generateDay(
        payload.startDate ?? 0,
        payload.endDate ?? 0
      );

      return db.$transaction([
        db.day.deleteMany({
          where: {
            weekId: id,
          },
        }),
        db.week.update({
          where: {
            id,
          },
          data: {
            endDate: payload.endDate,
            startDate: payload.startDate,
            weekNum: payload.weekNum,
          },
        }),
        ...generatedDays.map((d) => {
          return db.day.create({
            data: {
              day: d,
              id: uuidv4(),
              weekId: id,
            },
          });
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new week");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getWeeks() {
    return this.weekModel.getAllWeeks();
  }

  async getDaysByWeekId(id: string) {
    return this.weekModel.getWeeksById(id);
  }

  async getWeeksByUnitId(unitId: string | undefined) {
    return this.weekModel.getWeeksByUnitId(unitId);
  }

  async insertWeek(payload: IPostWeek) {
    const weekId = uuidv4();

    try {
      const generatedDays = generateDay(payload.startDate, payload.endDate);
      const allWeeks = await this.getWeeksByUnitId(payload.unitId);

      for (const week of allWeeks) {
        if (
          payload.startDate >= week.startDate &&
          payload.startDate <= week.endDate
        ) {
          throw createErrorObject(400, "Week already added");
        }
      }

      return db.$transaction([
        db.week.create({
          data: {
            endDate: payload.endDate,
            startDate: payload.startDate,
            weekNum: payload.weekNum,
            unitId: payload.unitId,
            id: weekId,
          },
        }),
        ...generatedDays.map((d) => {
          return db.day.create({
            data: {
              day: d,
              id: uuidv4(),
              weekId,
            },
          });
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new week");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
