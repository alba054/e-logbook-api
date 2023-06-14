import { describe, it } from "node:test";
import supertest from "supertest";
import { server } from "../src/Server";
import assert from "node:assert";
import { config } from "../src/config/Config";
import db from "../src/database";

const deleteAfterEachTest = async () => {
  await db.$transaction([
    db.user.deleteMany({ where: { username: "testusername" } }),
    db.student.deleteMany({ where: { studentId: "testid" } }),
  ]);
};

export const studentApiTest = async () => {
  describe("POST /students", () => {
    it("should return success message and status code 201", async () => {
      const result = await supertest(server.app)
        .post("/api/students")
        .send({
          username: "testusername",
          password: "testpassword",
          email: "test@mail.com",
          studentId: "testid",
        })
        .auth(
          config.config.ADMIN_USERNAME ?? "",
          config.config.ADMIN_PASSWORD ?? ""
        );

      assert.equal(201, result.statusCode);
      assert.match(
        result.body.data,
        /successfully register a new student with id/
      );
    });

    it("should return fail to insert message and status code 400", async () => {
      const result = await supertest(server.app)
        .post("/api/students")
        .send({
          username: "testusername",
          password: "testpassword",
          email: "test@mail.com",
          studentId: "testid",
        })
        .auth(
          config.config.ADMIN_USERNAME ?? "",
          config.config.ADMIN_PASSWORD ?? ""
        );

      assert.equal(400, result.statusCode);
      assert.match(
        result.body.data,
        /failed transaction of creating user and student/
      );
    });

    it("should return fail email required message and status code 400", async () => {
      const result = await supertest(server.app)
        .post("/api/students")
        .send({
          username: "testusername",
          password: "testpassword",
          studentId: "testid",
        })
        .auth(
          config.config.ADMIN_USERNAME ?? "",
          config.config.ADMIN_PASSWORD ?? ""
        );

      assert.equal(400, result.statusCode);
      assert.match(result.body.data, /email/);
    });
  });

  describe("GET /students/:username/reset-password", () => {
    it("should return status code 201 and return token", async () => {
      const result = await supertest(server.app)
        .get("/api/students/testusername/reset-password")
        .auth(
          config.config.ADMIN_USERNAME ?? "",
          config.config.ADMIN_PASSWORD ?? ""
        );

      assert.equal(201, result.statusCode);
      assert.match(result.body.data, /localhost/);
    });

    it("should return status code 400 and user's not found message", async () => {
      const result = await supertest(server.app)
        .get("/api/students/randomusername/reset-password")
        .auth(
          config.config.ADMIN_USERNAME ?? "",
          config.config.ADMIN_PASSWORD ?? ""
        );

      assert.equal(404, result.statusCode);
      assert.match(result.body.data, /user's not found/);
    });
  });

  await deleteAfterEachTest();
};
