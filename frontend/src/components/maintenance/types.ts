export type MaintenanceStatus = "Đang xử lý" | "Đã hoàn thành";

export type MaintenanceRecord = {
  id: number;
  equipmentId: number;
  createdById: number;
  quantity: number;
  type: string;
  issueDescription: string;
  startDate: string;
  endDate: string | null;
  content: string;
  assignedTo: string | null;
  repairResult: string | null;
  conditionAfter: string | null;
  cost: number | null;
  status: MaintenanceStatus;
  createdAt: string;
  equipment: {
    id: number;
    code: string;
    name: string;
    quantity: number;
  };
  createdBy: {
    id: number;
    code: string;
    name: string;
  };
};
