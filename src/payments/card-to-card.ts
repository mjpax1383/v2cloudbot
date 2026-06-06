import { BasePaymentGateway, PaymentResponse } from './types';

export class CardToCardGateway extends BasePaymentGateway {
  async createPayment(amount: number, description: string, callbackUrl: string): Promise<PaymentResponse> {
    // Card-to-card is manual. We just provide instructions.
    return {
      success: true,
      transactionId: `C2C-${Date.now()}`,
      paymentUrl: 'MANUAL_INSTRUCTIONS', // Bot will handle this
    };
  }

  async verifyPayment(transactionId: string, amount: number): Promise<boolean> {
    // Always returns false as it requires manual admin approval
    return false;
  }
}
