import { Elysia } from "elysia";
//import { FedimintClient } from "fedimint-ts";
import { loadConfigFromEnv } from "./config";
import { HttpStatusCode } from "elysia-http-status-code";
//import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { middleware_fedimint, middleware_cashu, middleware_l402 } from "./middleware";

const build402Headers = (): Record<string, string> => {
  return {
    "WWW-Authenticate": 'Bearer realm="Access to the requested resource", charset="UTF-8"',
    "X-Fedimint": "Your Fedimint details here",
    "X-Cashu": "Your Cashu details here",
  };
};

const check402Middleware = async (req: Request, mintUrl: string) => {
  const EXACTAMOUNT = 10;

  const fedimintHeader = req.headers.get("X-Fedimint");
  const cashuHeader = req.headers.get("X-Cashu");
  const authorizationHeader = req.headers.get("Authorization");
  let isSuccess = false;

  if (fedimintHeader) {
    isSuccess = middleware_fedimint(fedimintHeader);
  } else if (cashuHeader) {
    isSuccess = await middleware_cashu(cashuHeader, EXACTAMOUNT);
  } else if (authorizationHeader) {
    isSuccess = middleware_l402(authorizationHeader);
  }
  if (!isSuccess) {
    return {
      isError: true,
      data: {
        mintUrl,
        amount: EXACTAMOUNT,
      },
    };
  }

  return {
    isError: false,
    data: null,
  };
};

async function main() {
  const CONFIG = loadConfigFromEnv();

  // const fedimintClient = new FedimintClient({
  //     baseUrl: CONFIG.baseUrl,
  //     password: CONFIG.password,
  // });

  //  const cashuWallet = new CashuWallet(new CashuMint(CONFIG.mintUrl));

  const app = new Elysia()
    .use(HttpStatusCode())
    // Everything in this block is a paid route
    // Returns a 402 if the user is not authenticated or doesn't include a Fedimint or Cashu ecash header
    .guard(
      {
        async beforeHandle({ request, set, httpStatus }) {
          const { isError, data } = await check402Middleware(request, CONFIG.mintUrl);

          if (isError) {
            set.headers = build402Headers();
            set.status = httpStatus.HTTP_402_PAYMENT_REQUIRED;
            return {
              error: true,
              code: httpStatus.HTTP_402_PAYMENT_REQUIRED,
              message: "Payment Required",
              data,
            };
          }
          // If no error, continue to paid route
        },
      },
      (app) => app.get("/test", () => "Paid route"),
    )
    .get("/", () => "Hello Elysia")
    .listen(3003);

  console.log(`🦊 Elysia is running at on port ${app.server?.port}...`);
}

main();
