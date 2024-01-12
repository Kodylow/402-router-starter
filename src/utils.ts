import { SignJWT } from "jose";
import { CONFIG } from "./config";

export const createJWT = async (paymentHash: string) => {
    const jwt = await new SignJWT({ paymentHash: paymentHash })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('10m')
        .sign(new TextEncoder().encode(CONFIG.jwtSecret));
    return jwt;
};
