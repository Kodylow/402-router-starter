import { SignJWT } from "jose";
import { L402Authenticate } from "./middleware/L402";
import { Cashu402 } from "./middleware/Cashu";
import { CLIENTS, CONFIG } from ".";

export const createJWT = async (paymentHash: string) => {
    const jwt = await new SignJWT({ paymentHash: paymentHash })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('10m')
        .sign(new TextEncoder().encode(CONFIG.jwtSecret));
    return jwt;
};

export const build402Headers = async (exactRouteCost: number): Promise<Record<string, string>> => {
    const invoice = await CLIENTS.ln.requestInvoice({satoshi: 5});
    const l402Header = await L402Authenticate.create(invoice);
    const xCashuHeader = new Cashu402(exactRouteCost);
    return {
        'WWW-Authenticate': l402Header.to_string(),
        'X-Fedimint': "Your Fedimint details here",
        'X-Cashu': xCashuHeader.to_string(),
    };
};
