export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'canceled';

export interface CreatePaymentDto {
  orderId: string;
  description: string;
  amount: number;
}

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
  paymentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}