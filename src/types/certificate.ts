/**
 * Certificate Types
 * Centralized types for certificate-related entities
 */

export type CertificateType = "TUTORIAL" | "CATEGORY";

export interface Certificate {
  id: string;
  userId: string;
  type: CertificateType;
  entityId: string;
  entityTitle: string;
  entitySlug: string;
  completedAt: Date;
  issuedAt: Date;
  shareableId: string;
  shareableUrl?: string;
  isPublic: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  image?: string | null;
}

export interface CertificateWithUser extends Certificate {
  user: User;
}

export interface CertificateResponse {
  success: boolean;
  data?: CertificateWithUser;
  error?: string;
}

export interface CertificatesListResponse {
  success: boolean;
  certificates?: CertificateWithUser[];
  total?: number;
  error?: string;
}
