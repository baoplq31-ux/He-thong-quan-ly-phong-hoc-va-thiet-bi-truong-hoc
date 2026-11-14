import { BadRequestException } from "@nestjs/common";

export function requiredText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new BadRequestException(`${label} là bắt buộc.`);
  }
  return value.trim();
}

export function positiveId(value: unknown) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new BadRequestException("ID không hợp lệ.");
  }
  return id;
}

export function positiveInteger(value: unknown, label: string) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new BadRequestException(`${label} phải là số nguyên lớn hơn 0.`);
  }
  return number;
}
