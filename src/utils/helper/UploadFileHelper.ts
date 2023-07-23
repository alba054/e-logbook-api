import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export class UploadFileHelper {
  static uploadFileBuffer(
    originalName: string,
    filePath: string,
    buffer: Buffer
  ) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    const pathToSave = `${filePath}/${uuidv4()}${path.extname(originalName)}`;
    fs.createWriteStream(pathToSave).write(buffer);

    return pathToSave;
  }
}
