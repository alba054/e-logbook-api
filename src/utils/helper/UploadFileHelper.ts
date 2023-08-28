import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export class UploadFileHelper {
  static uploadFileBuffer(
    originalName: string,
    filePath: string,
    buffer: Buffer,
    isOriName?: boolean
  ) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    let pathToSave = "";
    if (isOriName) {
      pathToSave = `${filePath}/${originalName}`;
      fs.createWriteStream(pathToSave).write(buffer);
    } else {
      pathToSave = `${filePath}/${uuidv4()}${path.extname(originalName)}`;
      fs.createWriteStream(pathToSave).write(buffer);
    }

    return pathToSave;
  }
}
