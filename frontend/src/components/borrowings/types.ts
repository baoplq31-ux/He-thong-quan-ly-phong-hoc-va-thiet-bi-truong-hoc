export type BorrowingStatus =
  | "Chờ duyệt"
  | "Đã duyệt"
  | "Đang mượn"
  | "Đã trả"
  | "Từ chối"
  | "Quá hạn";

export type BorrowingRequest = {
  equipmentId: number;
  quantity: number;
  purpose: string;
  borrowDate: string;
  expectedReturnDate: string;
  note: string;
};

export type EquipmentBorrowing = {
  id: number;
  code: string;
  equipmentId: number;
  borrowerId: number;
  quantity: number;
  purpose: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string | null;
  status: BorrowingStatus;
  approvedAt?: string | null;
  conditionBefore?: string | null;
  conditionAfter?: string | null;
  returnedById?: number | null;
  returnedAt?: string | null;
  note?: string | null;
  returnNote?: string | null;
  createdAt: string;
  updatedAt: string;
  equipment: {
    id: number;
    code: string;
    name: string;
    type: string;
    quantity: number;
    availableQuantity: number;
    status: string;
    room: {
      id: number;
      code: string;
      name: string;
    };
  };
  borrower: {
    id: number;
    code: string;
    name: string;
    email: string;
    role: string;
  };
  approvedBy?: {
    id: number;
    code: string;
    name: string;
  } | null;
  returnedBy?: {
    id: number;
    code: string;
    name: string;
  } | null;
};
