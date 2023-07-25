import { Badge } from "@prisma/client";
import { IStudentProfileDTO } from "./StudentProfileDTO";
import { ISupervisorProfileDTO } from "./SupervisorDTO";

export interface IUserProfileDTO {
  id: string;
  username: string;
  email?: string;
  role: "SUPERVISOR" | "STUDENT";
  badges: Badge[];
  pic?: string;
  student?: IStudentProfileDTO;
  supervisor?: ISupervisorProfileDTO;
}
