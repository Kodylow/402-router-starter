
import { middleware_cashu } from "./Cashu";
import { middleware_fedimint } from "./Fedimint";
import { middleware_l402 } from "./L402";

export enum Enum402 {
    // FEDIMINT = 'fedimint',
    // CASHU = 'cashu',
    L402 = 'L402',
}


export const check402Middleware = async (req: Request, exactRouteCost: number): Promise<boolean> => {
    const fedimintHeader = req.headers.get('X-Fedimint');
    const cashuHeader = req.headers.get('X-Cashu');
    const authorizationHeader = req.headers.get('Authorization');

    if (fedimintHeader) {
        return await middleware_fedimint(fedimintHeader, exactRouteCost);
    } else if (cashuHeader) {
        return await middleware_cashu(cashuHeader, exactRouteCost);
    } else if (authorizationHeader) {
        return middleware_l402(authorizationHeader);
    }

    return false;
}
