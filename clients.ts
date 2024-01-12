import { FedimintClient } from "fedimint-ts";
import { CashuMint, CashuWallet } from "@cashu/cashu-ts";
import { LightningAddress } from "alby-tools";
import { CONFIG } from "./config";

interface Clients {
    fedimint: FedimintClient;
    cashu: CashuWallet;
    ln: LightningAddress;
}

const loadClients = async (): Promise<Clients> => {
    const fedimint = new FedimintClient({
        baseUrl: CONFIG.baseUrl,
        password: CONFIG.password,
    });
    const cashu = new CashuWallet(new CashuMint(CONFIG.mintUrl));
    const ln = new LightningAddress(CONFIG.lightningAddress);
    await ln.fetch();

    console.log('Loaded clients');

    return {
        fedimint,
        cashu,
        ln,
    };
}

const CLIENTS = await loadClients();

export default CLIENTS;
