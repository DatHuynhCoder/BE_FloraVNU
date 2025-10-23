export interface PayosPaymentCreatedData {
  bin: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  paymentLinkId: string;
  amount: number;
  description: string;
  orderCode: number;
  expiredAt: number;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}

export interface PayosPaymentCreatedResponse {
  code: string;
  desc: string;
  data: PayosPaymentCreatedData;
  signature: string;
}