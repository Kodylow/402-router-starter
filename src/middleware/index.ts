
import { middleware_cashu } from "./Cashu";
import { middleware_fedimint } from "./Fedimint";
import { middleware_l402 } from "./L402";

export enum Enum402 {
    FEDIMINT = 'Fedimint402',
    CASHU = 'Cashu402',
    L402 = 'L402',
}

export const check402Middleware = async (req: Request, exactRouteCost: number): Promise<boolean> => {
    const fedimintHeader = req.headers.get('X-Fedimint');
    const cashuHeader = req.headers.get('X-Cashu');
    const authorizationHeader = req.headers.get('Authorization');

    if (fedimintHeader) {
        console.log("check402Middleware - fedimintHeader: ", fedimintHeader)
        return await middleware_fedimint(fedimintHeader, exactRouteCost);
    } else if (cashuHeader) {
        console.log("check402Middleware - cashuHeader: ", cashuHeader)
        return await middleware_cashu(cashuHeader, exactRouteCost);
    } else if (authorizationHeader) {
        console.log("check402Middleware - authorizationHeader: ", authorizationHeader)
        return await middleware_l402(authorizationHeader);
    }

    return false;
}
