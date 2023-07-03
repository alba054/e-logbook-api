import db from "../database";
import { v4 as uuidv4 } from "uuid";

const main = async () => {
  await db.badge.deleteMany({});
  await db.unit.deleteMany({});

  await db.badge.createMany({
    data: [
      {
        name: "CEU",
      },
      {
        name: "ER",
      },
      {
        name: "HEAD_DIV",
      },
    ],
  });

  await db.unit.createMany({
    data: [
      { id: uuidv4(), name: "ANESTESI" },
      { id: uuidv4(), name: "BEDAH" },
      { id: uuidv4(), name: "FORENSIK" },
      { id: uuidv4(), name: "IKM-IKK" },
      { id: uuidv4(), name: "ilmu kesehatan anak" },
      { id: uuidv4(), name: "RADIOLOGI" },
      { id: uuidv4(), name: "Ilmu Penyakit mata" },
      { id: uuidv4(), name: "INTERNA" },
      { id: uuidv4(), name: "KARDIOLOGI" },
      { id: uuidv4(), name: "KESEHATAN JIWA" },
      { id: uuidv4(), name: "KULIT KELAMIN" },
      { id: uuidv4(), name: "KULIT KELAMIN" },
      { id: uuidv4(), name: "NEUROLOGI" },
      { id: uuidv4(), name: "OBSTETRI DAN GINEKOLOGI" },
      { id: uuidv4(), name: "ORTHOPEDI" },
      { id: uuidv4(), name: "THT-KL" },
    ],
  });
};

main();
