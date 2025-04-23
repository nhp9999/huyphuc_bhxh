export interface VNPTAccount {
  id?: number;
  maNhanVien: string;
  account: string;
  acpass: string;
  username: string;
  password: string;
  pattern: string;
  serial: string;
  serviceUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VNPTAccountResponse {
  id: number;
  maNhanVien: string;
  account: string;
  acpass: string;
  username: string;
  password: string;
  pattern: string;
  serial: string;
  serviceUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
