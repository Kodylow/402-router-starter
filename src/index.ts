import { loadClients } from "./clients";
import { loadConfigFromEnv } from "./config";
import { startServer } from "./server";

export const CONFIG = loadConfigFromEnv();
export const CLIENTS = await loadClients(CONFIG);
startServer(CONFIG);
