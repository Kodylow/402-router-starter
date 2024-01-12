import { SignJWT } from "jose";
import { L402Authenticate } from "./middleware/L402";
import { Cashu402 } from "./middleware/Cashu";
import { CONFIG } from ".";
import { Fedimint402 } from "./middleware/Fedimint";

export const createJWT = async (paymentHash: string) => {
    const jwt = await new SignJWT({ paymentHash: paymentHash })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('10m')
        .sign(new TextEncoder().encode(CONFIG.jwtSecret));
    return jwt;
};

export const build402Headers = async (exactRouteCost: number): Promise<Record<string, string>> => {
    const l402Header = await L402Authenticate.create(exactRouteCost);
    const xFedimintHeader = new Fedimint402(exactRouteCost);
    const xCashuHeader = new Cashu402(exactRouteCost);
    return {
        'WWW-Authenticate': l402Header.to_string(),
        'X-Fedimint': xFedimintHeader.to_string(),
        'X-Cashu': xCashuHeader.to_string(),
    };
};
