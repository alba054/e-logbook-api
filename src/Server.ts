import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ErrorHandler } from "./middleware/error/ErrorHandler";
import { UserRouter } from "./api/users/UserRouter";
import { StudentRouter } from "./api/students/StudentRouter";
import { UnitRouter } from "./api/units/UnitRouter";
import { ClinicalRecordRouter } from "./api/clinicalRecords/ClinicalRecordRouter";
import { SupervisorRouter } from "./api/supervisors/SupervisorRouter";
import { BadgeRouter } from "./api/badges/BadgeRouter";
import { AffectedPartRouter } from "./api/affectedParts/AffectedPartRouter";
import { ExaminationTypeRouter } from "./api/examinationTypes/ExaminationTypeRouter";
import { DiagnosisTypeRouter } from "./api/diagnosisTypes/DiagnosisTypeRouter";
import { ManagementTypeRouter } from "./api/managementTypes/ManagementTypeRouter";
import { ManagementRoleRouter } from "./api/managementRoles/ManagementRoleRouter";
import { ScientificSessionRouter } from "./api/scientificSessions/ScientificSessionRouter";
import { SelfReflectionRouter } from "./api/selfReflections/SelfReflectionRouter";
import { SessionTypeRouter } from "./api/sessionTypes/SessionTypeRouter";
import { ScientificRoleRouter } from "./api/scientificRole/ScientificRoleRouter";
import { CompetencyRouter } from "./api/competencies/CompetencyRouter";
import { SkillTypesRouter } from "./api/skillTypes/SkillTypesRouter";
import { CaseTypesRouter } from "./api/caseTypes/CaseTypesRouter";

dotenv.config();

class Server {
  app: express.Application;

  constructor() {
    this.app = express();
    this.config();
  }

  config() {
    this.app.disable("x-powered-by");
    this.app.use(function (req: Request, res: Response, next) {
      res.setHeader("Content-Security-Policy", "upgrade-insecure-requests");
      next();
    });

    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(
      "/api/uploaded-file",
      express.static(process.env.STATIC_URL ?? "media")
    );

    // * api base route
    this.app.use("/api", new UserRouter().register());
    this.app.use("/api", new StudentRouter().register());
    this.app.use("/api", new UnitRouter().register());
    this.app.use("/api", new ClinicalRecordRouter().register());
    this.app.use("/api", new SupervisorRouter().register());
    this.app.use("/api", new BadgeRouter().register());
    this.app.use("/api", new AffectedPartRouter().register());
    this.app.use("/api", new ExaminationTypeRouter().register());
    this.app.use("/api", new DiagnosisTypeRouter().register());
    this.app.use("/api", new ManagementTypeRouter().register());
    this.app.use("/api", new ManagementRoleRouter().register());
    this.app.use("/api", new ScientificSessionRouter().register());
    this.app.use("/api", new SelfReflectionRouter().register());
    this.app.use("/api", new SessionTypeRouter().register());
    this.app.use("/api", new ScientificRoleRouter().register());
    this.app.use("/api", new CompetencyRouter().register());
    this.app.use("/api", new SkillTypesRouter().register());
    this.app.use("/api", new CaseTypesRouter().register());
    // * error handling
    this.app.use(ErrorHandler);
  }

  start() {
    this.app.listen(
      Number(process.env.PORT) || 5000,
      process.env.HOST || "127.0.0.1",
      () => {
        console.log(
          `server is running on ${process.env.HOST ?? "127.0.0.1"}:${
            process.env.PORT ?? 5000
          }`
        );
      }
    );
  }
}

export const server = new Server();
