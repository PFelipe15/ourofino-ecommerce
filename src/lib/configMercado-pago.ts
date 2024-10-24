// Step 1: Import the parts of the module you want to use
import { CardToken, Customer, CustomerCard, MercadoPagoConfig, Payment, PaymentMethod, Preference, } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN!;

 
const client = new MercadoPagoConfig({ accessToken: accessToken, options: { timeout: 5000, idempotencyKey: 'abc' } });

const payment = new Payment(client);

const preference = new Preference(client)

const paymentMethod = new PaymentMethod(client);

const cardToken = new CardToken(client);

const customer = new Customer(client);

paymentMethod.get();
 

export  {payment, preference, cardToken, paymentMethod, customer};
