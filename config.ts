import dotenv from 'dotenv';

dotenv.config();

interface Config {
  federationInviteCode: string;
  secretKey: string;
  fmDbPath: string;
  password: string;
  domain: string;
  port: number;
  baseUrl: string;
  mintUrl: string;
}

function loadConfigFromEnv(): Config {
  const {
    FEDERATION_INVITE_CODE,
    SECRET_KEY,
    FM_DB_PATH,
    PASSWORD,
    DOMAIN,
    PORT,
    BASE_URL,
    MINT_URL,
  } = process.env;

  if (!FEDERATION_INVITE_CODE || !SECRET_KEY || !FM_DB_PATH || !PASSWORD || !DOMAIN || !PORT || !BASE_URL || !MINT_URL) {
    throw new Error('Environment configuration is missing. Please set all required environment variables.');
  }

  return {
    federationInviteCode: FEDERATION_INVITE_CODE,
    secretKey: SECRET_KEY,
    fmDbPath: FM_DB_PATH,
    password: PASSWORD,
    domain: DOMAIN,
    port: parseInt(PORT, 10),
    baseUrl: BASE_URL,
    mintUrl: MINT_URL,
  };
}

export { loadConfigFromEnv };
