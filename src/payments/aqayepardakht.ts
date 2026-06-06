import { BasePaymentGateway, PaymentResponse } from './types';

export class AqayePardakhtGateway extends BasePaymentGateway {
    async createPayment(amount: number, description: string, callbackUrl: string): Promise<PaymentResponse> {
        const response = await fetch('https://panel.aqayepardakht.ir/api/v2/create', {
            method: 'POST',
            body: new URLSearchParams({
                pin: this.config.pin,
                amount: amount.toString(),
                callback: callbackUrl,
                description: description,
            }),
        });
        const data: any = await response.json();
        if (data.status === 'success') {
            return {
                success: true,
                transactionId: data.transid,
                paymentUrl: `https://panel.aqayepardakht.ir/startpay/${data.transid}`,
            };
        }
        return { success: false, error: data.message };
    }

    async verifyPayment(transactionId: string, amount: number): Promise<boolean> {
        const response = await fetch('https://panel.aqayepardakht.ir/api/v2/verify', {
            method: 'POST',
            body: new URLSearchParams({
                pin: this.config.pin,
                amount: amount.toString(),
                transid: transactionId,
            }),
        });
        const data: any = await response.json();
        return data.status === 'success';
    }
}
