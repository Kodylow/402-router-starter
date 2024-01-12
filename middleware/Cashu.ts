import { Token, getDecodedToken } from "@cashu/cashu-ts";
import CONFIG from "../config";
import CLIENTS from "../clients";

export const middleware_cashu = (encodedToken: string, exactRouteCost: number): boolean => {
    // Decode to a cashu token
    try {
        const token = getDecodedToken(encodedToken);
        // Check the token is valid and for exact amount
        if (!verifyCashuToken(token, exactRouteCost)) {
            return false;
        }
    } catch (e) {
        console.error(e);
        return false;
    }

    // Try to reissue the token
    try {
        CLIENTS.cashu.receive(encodedToken);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

/**
 * When paying using X-Cashu, the client sends a cashu token in the header.
 * The token's proofs MUST match the configured mintURL.
 * The token's amount MUST match the exact route cost. (If overpaid or underpaid, just don't redeem and throw an error)
 * 
 * @param token 
 * @param exactRouteCost 
 * @returns boolean
 */
const verifyCashuToken = (token: Token, exactRouteCost: number): boolean => {
    let tokenAmount = 0;
    for (const tokenentry of token.token) {
        // Check the token is from our mint
        if (tokenentry.mint !== CONFIG.mintUrl) {
            console.error(`Token mint ${tokenentry.mint} does not match our mint ${CONFIG.mintUrl}`);
            return false;
        }
        for (const proof of tokenentry.proofs) {
            tokenAmount += proof.amount;
        }
    }

    // Check the token is for the exact route cost
    if (tokenAmount !== exactRouteCost) {
        console.error(`Token amount ${tokenAmount} does not match exact route cost ${exactRouteCost}`);
        return false;
    }

    return true;
}
