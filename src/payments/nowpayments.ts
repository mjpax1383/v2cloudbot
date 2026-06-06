import { BasePaymentGateway, PaymentResponse } from './types';

export class NowPaymentsGateway extends BasePaymentGateway {
  async createPayment(amount: number, description: string, callbackUrl: string): Promise<PaymentResponse> {
    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: 'usdttrc20',
        order_id: description,
        cancel_url: callbackUrl,
        success_url: callbackUrl,
      }),
    });
    const data: any = await response.json();
    if (!response.ok) return { success: false, error: data.message };
    return {
      success: true,
      transactionId: data.payment_id,
      paymentUrl: data.invoice_url,
    };
  }

  async verifyPayment(transactionId: string, amount: number): Promise<boolean> {
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${transactionId}`, {
      headers: { 'x-api-key': this.config.apiKey },
    });
    const data: any = await response.json();
    return data.payment_status === 'finished';
  }
}
