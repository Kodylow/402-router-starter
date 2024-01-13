import Elysia from "elysia";
import { check402Middleware } from "./middleware";
import { Config } from "./config";
import { build402Headers } from "./utils";

export const startServer = async (config: Config) => {
  const app = new Elysia()
    // All routes inside this guard are paid routes with a cost of 1 sat
    // For ecash it's 1 sat per api call
    // For L402 it's 1 sat for a jwt that lasts 10 minutes
    .guard(
      {
        beforeHandle: async ({ request, set }) => {
          const EXACT_ROUTE_COST = 1;
          console.log("Checking 402");
          const isValid = await check402Middleware(request, EXACT_ROUTE_COST);
          if (!isValid) {
            console.log("402 not valid");
            set.headers = await build402Headers(EXACT_ROUTE_COST); // Await the async function directly
            set.status = "Payment Required";
            return set;
          }
        },
      },
      (app) => app.get("/test", () => "Paid route"),
    )
    .get("/", () => "Hello Elysia")
    .listen(3003);

  console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);
};
