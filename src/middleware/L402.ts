import { jwtVerify } from "jose";
import { createJWT } from "../utils";
import { Invoice } from "alby-tools";

import { Enum402 } from ".";
import { CONFIG } from "..";

export const middleware_l402 = (authorizationHeader: string): boolean => {
    // Try to decode the auth header
    try {
        const l402Authorization = decodeL402Authorization(authorizationHeader);
        // Verify the token is valid and preimage matches
        if (!verifyL402Authorization(l402Authorization)) {
            return false;
        }

        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export class L402Authenticate {
    type: Enum402;
    token: string;
    invoice: string;

    private constructor(invoice: Invoice, token: string) {
        this.type = Enum402.L402;
        this.invoice = invoice.paymentRequest;
        this.token = token;
    }

    static async create(invoice: Invoice): Promise<L402Authenticate> {
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
    const [type, credentials] = authorizationHeader.split(' ');
    if (!Object.values(Enum402).includes(type as Enum402)) {
        throw new Error('Invalid L402 type');
    }

    const [token, preimage] = credentials.split(':');
    if (!token || !preimage) {
        throw new Error('Invalid L402 credentials');
    }

    return {
        type: type as Enum402,
        token,
        preimage,
    };
}

const verifyL402Authorization = async (l402: L402Authorization): Promise<boolean> => {
    try {
        let { payload } = await jwtVerify(l402.token, new TextEncoder().encode(CONFIG.jwtSecret));
        
        const hasher = new Bun.CryptoHasher('sha256');
        const hash = hasher.update(l402.preimage).digest('hex');
        if (payload && payload['paymentHash'] && hash === payload['paymentHash']) {
            return true;
        }

        throw new Error('Invalid L402 preimage');
    } catch (e) {
        console.error(e);
        return false;
    }
}
