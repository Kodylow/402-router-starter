import { Elysia } from 'elysia';
import { HttpStatusCode } from 'elysia-http-status-code';
import { Enum402, L402Authenticate } from './middleware/L402';
import { check402Middleware } from './middleware';
import CLIENTS from './clients';

const build402Headers = async (): Promise<Record<string, string>> => {
    const invoice = await CLIENTS.ln.requestInvoice({satoshi: 5});
    const l402Header = new L402Authenticate(Enum402.L402, invoice);
    return {
        'WWW-Authenticate': l402Header.to_string(),
        'X-Fedimint': "Your Fedimint details here",
        'X-Cashu': 'Your Cashu details here'
    };
};

const startServer = async () => {
    const app = new Elysia()
        .use(HttpStatusCode())
        // Everything in this block is a paid route for 1 satoshi of ecashper call or a 1 satoshi L402 valid for 1 minute
        // Returns a 402 if the user is not authenticated or doesn't include a Fedimint or Cashu ecash header
        .guard(
        {
            beforeHandle({ request, set, httpStatus }) {
                const EXACT_ROUTE_COST = 1;
                if (!check402Middleware(request, EXACT_ROUTE_COST)) {
                    async () => {
                        set.headers = await build402Headers();
                    }
                    set.status = httpStatus.HTTP_402_PAYMENT_REQUIRED;
                    return {
                        error: true,
                        code: httpStatus.HTTP_402_PAYMENT_REQUIRED,
                        message: 'Payment Required',
                        data: "Payment required to access this resource, see headers for supported payment methods."
                    }
                }
            }
        },
        (app) =>
            app
                .get('/test', () => 'Paid route')
    )
    .get('/', () => 'Hello Elysia')
    .listen(3003)

    console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)
}

export default startServer;
