export interface ISupervisorProfileDTO {
  userId: string;
  id: string;
  supervisorId?: string;
  fullName?: string;
  locations?: string[] | number[];
  units?: string[] | number[];
}
