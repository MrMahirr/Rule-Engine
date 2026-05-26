export interface FieldPayload {
  name: string;
  description?: string;
  type?: 'string' | 'number' | 'boolean';
}

export interface FieldResponse extends FieldPayload {
  id: string;
  createdAt: string;
}
