
import { middleware_cashu } from "./Cashu";
import { middleware_l402 } from "./L402";


export const check402Middleware = (req: Request, exactRouteCost: number): boolean => {
    const fedimintHeader = req.headers.get('X-Fedimint');
    const cashuHeader = req.headers.get('X-Cashu');
    const authorizationHeader = req.headers.get('Authorization');

    if (fedimintHeader) {
        return middleware_fedimint(fedimintHeader);
    } else if (cashuHeader) {
        return middleware_cashu(cashuHeader, 1);
    } else if (authorizationHeader) {
        return middleware_l402(authorizationHeader);
    }

    return false;
}

const middleware_fedimint = (xFedimintHeader: string): boolean => {
    return true;
}
