export interface PayosRequestPaymentItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PayosRequestPaymentPayload {
  orderCode: number;
  amount: number;
  description: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items?: PayosRequestPaymentItem[];
  cancelUrl: string;
  returnUrl: string;
  expiredAt?: number;
  signature: string;
}