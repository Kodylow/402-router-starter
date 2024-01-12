import { Elysia } from 'elysia';
import { L402Authenticate } from './middleware/L402';
import { check402Middleware } from './middleware';
import CLIENTS from './clients';
import { Cashu402 } from './middleware/Cashu';

const build402Headers = async (exactRouteCost: number): Promise<Record<string, string>> => {
    const invoice = await CLIENTS.ln.requestInvoice({satoshi: 5});
    const l402Header = await L402Authenticate.create(invoice);
    const xCashuHeader = new Cashu402(exactRouteCost);
    return {
        'WWW-Authenticate': l402Header.to_string(),
        'X-Fedimint': "Your Fedimint details here",
        'X-Cashu': xCashuHeader.to_string(),
    };
};

const startServer = async () => {
    const app = new Elysia()
        .guard(
        {
            beforeHandle: async ({ request, set }) => { // Make this an async function
                const EXACT_ROUTE_COST = 1;
                console.log("Checking 402");
                const isValid = await check402Middleware(request, EXACT_ROUTE_COST);
                if (!isValid) {
                    console.log("402 not valid");
                    set.headers = await build402Headers(EXACT_ROUTE_COST); // Await the async function directly
                    set.status = 'Payment Required';
                    return set;
                }
            }
        },
        (app) =>
            app
                .get('/test', () => 'Paid route')
    )
    .get('/', () => 'Hello Elysia')
    .listen(3003);

    console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);
}

startServer();
