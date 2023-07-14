import multer from "multer";

export class MulterHelper {
  private storage: multer.StorageEngine;
  public upload: multer.Multer;

  constructor() {
    this.storage = multer.memoryStorage();
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: 5e6,
      },
    });
  }
}

export const multerHelper = new MulterHelper();
