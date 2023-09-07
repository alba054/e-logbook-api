import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs/promises";

dotenv.config();

export const createResponse = (status: string, data: any = null) => {
  if (data) {
    return { status, data };
  }

  return { status, data: data };
};

export const createErrorObject = (
  error: number = 500,
  message: string = "Internal Error"
) => {
  return { error, message };
};

export const generateRandomString = (length: number) => {
  const characters = "0123456789";
  const charactersLength = characters.length;
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(
      (crypto.randomBytes(1)[0] / 256) * charactersLength
    );
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
};

export const getUnixTimestamp = () => Math.floor(new Date().getTime() / 1000);

export const deleteFileByPath = (path: string) => {
  return fs.unlink(path);
};

// generate day from startTime to endTime
// startTime and endTime in seconds
export const generateDay = (startTime: number, endTime: number) => {
  let curTime = startTime;
  const DAYS = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  const results = [];

  while (curTime <= endTime) {
    const day = new Date(curTime * 1000).getDay();
    results.push(DAYS[day]);
    curTime += 24 * 3600;
  }

  return results;
};

export const constants = {
  SUCCESS_RESPONSE_MESSAGE: "success",
  FAILED_RESPONSE_MESSAGE: "failed",
  ACCESS_TOKEN_EXP: 24 * 60 * 60 * 30, // *  1 month
  REFRESH_TOKEN_EXP: 24 * 60 * 60 * 30, // * 1 month
  PASSWORD_RESET_TOKEN_EXP: 5 * 60 * 1000,
  INVALID_TOKEN: "token is invalid",
  MALFORMED_TOKEN:
    "token is not formed correctly. JWT format is xxxx.yyyyy.zzzz",
  SIGNATURE_REQUIRED: "provide secret key to verify token",
  INVALID_SIGNATURE: "secret key is not valid",
  STUDENT_ROLE: "STUDENT",
  SUPERVISOR_ROLE: "SUPERVISOR",
  ER_ROLE: "ER",
  CEU_BADGE: "CEU",
  HEAD_DIV_BADGE: "HEAD_DIV",
  ADMIN_ROLE: "ADMIN",
  DPK_ROLE: "DPK",
  CLINICAL_RECORD_ATTACHMENT_PATH: "storage/clinical-record/",
  SCIENTIFIC_SESSION_ATTACHMENT_PATH: "storage/scientific-session/",
  ABS_PATH: process.env.ABS_PATH,
  PROFILE_PIC_PATH: "storage/user-pic/",
  ASSESMENT_DOC_PATH: "storage/assesment/",
  HISTORY_ELEMENTS_PER_PAGE: 25,
  REFERENCE_PATH: "storage/reference/",
};
