import { Elysia } from "elysia";
import { FedimintClient } from "fedimint-ts";
import { loadConfigFromEnv } from "./config";
import { HttpStatusCode } from "elysia-http-status-code";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";

const build402Headers = (): Record<string, string> => {
  return {
    "WWW-Authenticate": 'Bearer realm="Access to the requested resource", charset="UTF-8"',
    "X-Fedimint": "Your Fedimint details here",
    "X-Cashu": "Your Cashu details here",
  };
};

const check402Middleware = (req: Request): boolean => {
  const EXACTAMOUNT = 3;

  const fedimintHeader = req.headers.get("X-Fedimint");
  const cashuHeader = req.headers.get("X-Cashu");
  const authorizationHeader = req.headers.get("Authorization");

  if (fedimintHeader) {
    return middleware_fedimint(fedimintHeader);
  } else if (cashuHeader) {
    return middleware_cashu(cashuHeader, EXACTAMOUNT);
  } else if (authorizationHeader) {
    return middleware_l402(authorizationHeader);
  }

  return false;
};

async function main() {
  const CONFIG = loadConfigFromEnv();

  // const fedimintClient = new FedimintClient({
  //     baseUrl: CONFIG.baseUrl,
  //     password: CONFIG.password,
  // });

  const cashuWallet = new CashuWallet(new CashuMint(CONFIG.mintUrl));

  const app = new Elysia()
    .use(HttpStatusCode())
    // Everything in this block is a paid route
    // Returns a 402 if the user is not authenticated or doesn't include a Fedimint or Cashu ecash header
    .guard(
      {
        beforeHandle({ request, set, httpStatus }) {
          if (!check402Middleware(request)) {
            set.headers = build402Headers();
            set.status = httpStatus.HTTP_402_PAYMENT_REQUIRED;
            return {
              error: true,
              code: httpStatus.HTTP_402_PAYMENT_REQUIRED,
              message: "Payment Required",
              data: "Payment required to access this resource, see headers for supported payment methods.",
            };
          }
        },
      },
      (app) => app.get("/test", () => "Paid route"),
    )
    .get("/", () => "Hello Elysia")
    .listen(3003);

  console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);
}

main();
