import supertest from "supertest";
import { server } from "../src/Server";
import { config } from "../src/config/Config";
import db from "../src/database";

const deleteAfterEachTest = async () => {
  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { username: "testusername" } }),
    db.user.deleteMany({ where: { username: "testusername" } }),
    db.student.deleteMany({ where: { studentId: "testid" } }),
  ]);
};

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

    expect(result.statusCode).toBe(201);
    expect(result.body.data).toMatch(
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

    expect(result.statusCode).toBe(400);
    expect(result.body.data).toMatch(
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

    expect(result.statusCode).toBe(400);
    expect(result.body.data).toMatch(/email/);
  });
});

describe("POST /students/reset-password", () => {
  it("should return status code 201 and return token", async () => {
    const result = await supertest(server.app)
      .post("/api/students/reset-password")
      .auth(
        config.config.ADMIN_USERNAME ?? "",
        config.config.ADMIN_PASSWORD ?? ""
      )
      .send({
        email: "test@mail.com",
      });

    expect(result.statusCode).toBe(201);
    expect(result.body.status).toMatch(/success/);
    expect(result.body.data.token).toBeDefined();
    expect(result.body.data.otp).toBeDefined();
  });
  it("should return status code 400 and user's not found message", async () => {
    const result = await supertest(server.app)
      .post("/api/students/reset-password")
      .auth(
        config.config.ADMIN_USERNAME ?? "",
        config.config.ADMIN_PASSWORD ?? ""
      )
      .send({
        email: "tes@mail.com",
      });

    expect(result.statusCode).toBe(404);
    expect(result.body.data).toMatch(/user's not found/);
  });
});

describe("POST /students/reset-password/{token}", () => {
  it("should return status code 200 and success reset password", async () => {
    const result = await supertest(server.app)
      .post("/api/students/reset-password")
      .auth(
        config.config.ADMIN_USERNAME ?? "",
        config.config.ADMIN_PASSWORD ?? ""
      )
      .send({
        email: "test@mail.com",
      });

    const token = result.body.data.token;
    const otp = result.body.data.otp;
    const result2 = await supertest(server.app)
      .post("/api/students/reset-password/" + token)
      .auth(
        config.config.ADMIN_USERNAME ?? "",
        config.config.ADMIN_PASSWORD ?? ""
      )
      .send({
        newPassword: "newpassword",
        otp,
      });

    expect(result2.statusCode).toBe(200);
    expect(result2.body.status).toMatch(/success/);
  });

  deleteAfterEachTest();
});
