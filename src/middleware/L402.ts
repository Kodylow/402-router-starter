import { jwtVerify } from "jose";
import { createJWT } from "../utils";
import { Invoice } from "alby-tools";

import { Enum402 } from ".";
import { CLIENTS, CONFIG } from "..";

/**
 * L402 is useful for paying for a session or api key that is valid for a certain amount of time.
 * Client hits the route, server returns L402 WWW-Authenticate header scheme of:
 * "WWW-Authenticate: L402 token='token', invoice='lnbc1...'"
 *
 * The token can be any cryptographic commitment like a JWT, Macaroon, or Rune.
 * The token MUST commit to the payment hash of the corresponding invoice.
 *
 * The client pays the invoice and receives the preimage as proof of payment.
 * Client then sends the preimage and token in the L402 Authorization header scheme of:
 * "Authorization: L402 token:preimage" to
 *
 * The server MUST verify that the hash of the preimage matches the payment hash in the token.
 *
 * The completed L402 Authorization with ONLY the preimage check DOES NOT EXPIRE, so it can be used for long term sessions.
 * The token SHOULD commit to additional caveats or restrictions like expiry time or number of uses, but this is not required.
 * @param authorizationHeader
 * @returns
 */
export const middleware_l402 = async (authorizationHeader: string): Promise<boolean> => {
  console.log("middleware_l402: ", authorizationHeader);
  // Try to decode the auth header
  try {
    const l402Authorization = decodeL402Authorization(authorizationHeader);
    // Verify the token is valid and preimage matches
    console.log("middleware_l402 - l402Authorization: ", l402Authorization);
    return await isValidL402(l402Authorization);
  } catch (e) {
    console.error(e);
    return false;
  }
};

export class L402Authenticate {
  type: Enum402;
  token: string;
  invoice: string;

  private constructor(invoice: Invoice, token: string) {
    this.type = Enum402.L402;
    this.invoice = invoice.paymentRequest;
    this.token = token;
  }

  static async create(exactRouteCost: number): Promise<L402Authenticate> {
    const invoice = await CLIENTS.ln.requestInvoice({ satoshi: exactRouteCost });
    const token = await createJWT(invoice.paymentHash);
    return new L402Authenticate(invoice, token);
  }

  to_string(): string {
    return `L402 token='${this.token}', invoice='${this.invoice}'`;
  }
}

interface L402Authorization {
  type: Enum402;
  token: string;
  preimage: string;
}

const decodeL402Authorization = (authorizationHeader: string): L402Authorization => {
  console.log("decodeL402Authorization: ", authorizationHeader);
  const [type, credentials] = authorizationHeader.split(" ");
  if (!Object.values(Enum402).includes(type as Enum402)) {
    throw new Error("Invalid L402 type");
  }

  const [token, preimage] = credentials.split(":");
  if (!token || !preimage) {
    throw new Error("Invalid L402 credentials");
  }

  return {
    type: type as Enum402,
    token,
    preimage,
  };
};

const isValidL402 = async (l402: L402Authorization): Promise<boolean> => {
  try {
    let { payload } = await jwtVerify(l402.token, new TextEncoder().encode(CONFIG.jwtSecret));

    // Convert preimage to hex before hashing
    const preimageHex = Buffer.from(l402.preimage, "hex");

    const hasher = new Bun.CryptoHasher("sha256");
    const hash = hasher.update(preimageHex).digest("hex");
    if (payload && payload["paymentHash"] && hash === payload["paymentHash"]) {
      return true;
    }

    throw new Error("Invalid L402 preimage");
  } catch (e) {
    console.error(e);
    return false;
  }
};
