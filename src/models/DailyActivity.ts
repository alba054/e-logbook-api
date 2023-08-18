import db from "../database";

export class DailyActivity {
  async getDailyActivityById(id: string) {
    return db.dailyActivity.findUnique({
      where: {
        id,
      },
      include: {
        activities: {
          include: {
            ActivityName: true,
            location: true,
          },
        },
        Student: true,
      },
    });
  }
}
