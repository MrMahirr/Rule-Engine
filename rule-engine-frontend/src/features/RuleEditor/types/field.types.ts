export type FieldType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'DATETIME' | 'ENUM';

export interface FieldPayload {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  allowedValues?: string[];
}

export interface FieldResponse {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  allowedValues: string[];
  createdAt: string;
  updatedAt: string;
}
