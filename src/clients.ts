import { FedimintClient } from "fedimint-ts";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { LightningAddress } from "alby-tools";
import { Config } from "./config";

interface Clients {
    fedimint: FedimintClient;
    cashu: CashuWallet;
    ln: LightningAddress;
}

export const loadClients = async (config: Config): Promise<Clients> => {
    const fedimint = new FedimintClient({
        baseUrl: config.baseUrl,
        password: config.password,
    });
    console.log('Loaded fedimint client...');
    const cashu = new CashuWallet(new CashuMint(config.mintUrl));
    console.log('Loaded cashu client...');
    const ln = new LightningAddress(config.lightningAddress);
    await ln.fetch();
    console.log('Loaded ln client...');

    return {
        fedimint,
        cashu,
        ln,
    };
}
