import { CLIENTS, CONFIG } from "..";

export class Fedimint402 {
    inviteCode: string;
    amount: number;

    constructor(amount: number) {
        this.inviteCode = CONFIG.federationInviteCode;
        this.amount = amount;
    }

    to_string(): string {
        return `Fedimint402 inviteCode='${this.inviteCode}', amount='${this.amount}'`;
    }
}

export const middleware_fedimint = async (xFedimintHeader: string, exactRouteCost: number): Promise<boolean> => {
    try {
        // TODO: should have a way to validate the fedimint oob notes in the typescript library
        const { amount_msat } = await CLIENTS.fedimint.mint.validate({ notes: JSON.parse(xFedimintHeader) });
        // Check the amount == exact route cost
        if (amount_msat !== exactRouteCost) {
            console.error(`Fedimint mint amount ${amount_msat} does not match exact route cost ${exactRouteCost}`);
            return false;
        }

        // Try to reissue the token
        await CLIENTS.fedimint.mint.reissue({ notes: JSON.parse(xFedimintHeader) });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}
