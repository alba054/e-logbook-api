import db from "../database";
import { v4 as uuidv4 } from "uuid";

const main = async () => {
  await db.badge.createMany({
    data: [
      {
        name: "CEU",
      },
      {
        name: "HEAD_DIV",
      },
    ],
  });

  const anestesiId = uuidv4();

  await db.unit.createMany({
    data: [
      { id: anestesiId, name: "ANESTESI" },
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

  await db.examinationType.createMany({
    data: [
      {
        id: uuidv4(),
        typeName: "examination type 1",
        unitId: anestesiId,
      },
      {
        id: uuidv4(),
        typeName: "examination type 2",
        unitId: anestesiId,
      },
      {
        id: uuidv4(),
        typeName: "examination type 3",
        unitId: anestesiId,
      },
    ],
  });

  await db.diagnosisType.createMany({
    data: [
      {
        id: uuidv4(),
        typeName: "diagnosis type 1",
        unitId: anestesiId,
      },
      {
        id: uuidv4(),
        typeName: "diagnosis type 2",
        unitId: anestesiId,
      },
      {
        id: uuidv4(),
        typeName: "diagnosis type 3",
        unitId: anestesiId,
      },
    ],
  });

  await db.managementType.createMany({
    data: [
      {
        id: uuidv4(),
        typeName: "management type 1",
        unitId: anestesiId,
      },
      {
        id: uuidv4(),
        typeName: "management type 2",
        unitId: anestesiId,
      },
      {
        id: uuidv4(),
        typeName: "management type 3",
        unitId: anestesiId,
      },
    ],
  });

  await db.managementRole.createMany({
    data: [
      {
        id: uuidv4(),
        roleName: "management role 1",
      },
      {
        id: uuidv4(),
        roleName: "management role 2",
      },
      {
        id: uuidv4(),
        roleName: "management role 3",
      },
    ],
  });

  await db.affectedPart.createMany({
    data: [
      {
        id: uuidv4(),
        partName: "left eye",
        unitId: anestesiId,
      },
      {
        id: uuidv4(),
        partName: "right eye",
        unitId: anestesiId,
      },
      {
        id: uuidv4(),
        partName: "both",
        unitId: anestesiId,
      },
    ],
  });
};

main();
