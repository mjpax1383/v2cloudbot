export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

export interface IPaymentGateway {
  createPayment(amount: number, description: string, callbackUrl: string): Promise<PaymentResponse>;
  verifyPayment(transactionId: string, amount: number): Promise<boolean>;
}

export abstract class BasePaymentGateway implements IPaymentGateway {
  constructor(protected config: any) {}
  abstract createPayment(amount: number, description: string, callbackUrl: string): Promise<PaymentResponse>;
  abstract verifyPayment(transactionId: string, amount: number): Promise<boolean>;
}
