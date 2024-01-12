import { jwtVerify } from "jose";
import { createHash } from 'crypto';
import { createJWT } from "../utils";
import { Invoice } from "alby-tools";
import CONFIG from "../config";

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

// Helper function to calculate SHA256 hash
function sha256(data: string | Buffer): string {
    return createHash('sha256').update(data).digest('hex');
}

export class L402Authenticate {
    type: Enum402;
    token: string;
    invoice: string;

    constructor(type: Enum402, invoice: Invoice) {
        this.type = type;
        this.invoice = invoice.paymentRequest;
        this.token = '';
        const init = async () => {
            this.token = await createJWT(invoice.paymentHash);
        }
        init();
    }

    to_string(): string {
        return `L402 token='${this.token}', invoice='${this.invoice}'`;
    }
}

export enum Enum402 {
    // FEDIMINT = 'fedimint',
    // CASHU = 'cashu',
    L402 = 'L402',
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
        
        let hash = sha256(l402.preimage);
        if (payload && payload['paymentHash'] && hash === payload['paymentHash']) {
            return true;
        }

        throw new Error('Invalid L402 preimage');
    } catch (e) {
        console.error(e);
        return false;
    }
}
