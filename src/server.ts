import Elysia from "elysia";
import { check402Middleware } from "./middleware";
import { Config } from "./config";
import { build402Headers } from "./utils";


export const startServer = async (config: Config) => {
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
