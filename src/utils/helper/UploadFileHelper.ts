import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export class UploadFileHelper {
  static uploadFileBuffer(path: string, buffer: Buffer) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    const pathToSave = `${path}/${uuidv4()}`;
    fs.createWriteStream(pathToSave).write(buffer);

    return pathToSave;
  }
}
