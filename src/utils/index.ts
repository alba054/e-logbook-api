import crypto from "crypto";

export const createResponse = (status: string, data: any = null) => {
  if (data) {
    return { status, data };
  }

  return { status, message: data };
};

export const createErrorObject = (
  error: number = 500,
  message: string = "Internal Error"
) => {
  return { error, message };
};

export const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

export const constants = {
  SUCCESS_RESPONSE_MESSAGE: "success",
  FAILED_RESPONSE_MESSAGE: "failed",
  ACCESS_TOKEN_EXP: 60, // * 1 minute
  REFRESH_TOKEN_EXP: 24 * 60 * 60 * 30, // * 1 month
  PASSWORD_RESET_TOKEN_EXP: 5 * 60 * 1000,
};
