import { Elysia } from 'elysia';
import { Enum402, L402Authenticate } from './middleware/L402';
import { check402Middleware } from './middleware';
import CLIENTS from './clients';

const build402Headers = async (): Promise<Record<string, string>> => {
    const invoice = await CLIENTS.ln.requestInvoice({satoshi: 5});
    const l402Header = await L402Authenticate.create(Enum402.L402, invoice);
    return {
        'WWW-Authenticate': l402Header.to_string(),
        'X-Fedimint': "Your Fedimint details here",
        'X-Cashu': 'Your Cashu details here'
    };
};

const startServer = async () => {
    const app = new Elysia()
        .guard(
        {
            beforeHandle: async ({ request, set }) => { // Make this an async function
                const EXACT_ROUTE_COST = 1;
                console.log("Checking 402");
                if (!check402Middleware(request, EXACT_ROUTE_COST)) {
                    console.log("402 not valid");
                    set.headers = await build402Headers(); // Await the async function directly
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
