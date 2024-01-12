import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  federationInviteCode: string;
  secretKey: string;
  fmDbPath: string;
  password: string;
  domain: string;
  port: number;
  baseUrl: string;
  mintUrl: string;
  jwtSecret: string;
  lightningAddress: string;
}

export const loadConfigFromEnv = (): Config => {
  const {
    FEDERATION_INVITE_CODE,
    SECRET_KEY,
    FM_DB_PATH,
    PASSWORD,
    DOMAIN,
    PORT,
    BASE_URL,
    MINT_URL,
    JWT_SECRET,
    LIGHTNING_ADDRESS,
  } = process.env;

  const ERRORMSG = 'Environment configuration is missing. Please set: ';

  if (!FEDERATION_INVITE_CODE) {
    throw new Error(ERRORMSG + 'FEDERATION_INVITE_CODE');
  } 
  if (!SECRET_KEY) {
    throw new Error(ERRORMSG + 'SECRET_KEY');
  }
  if (!FM_DB_PATH) {
    throw new Error(ERRORMSG + 'FM_DB_PATH');
  }
  if (!PASSWORD) {
    throw new Error(ERRORMSG + 'PASSWORD');
  }
  if (!DOMAIN) {
    throw new Error(ERRORMSG + 'DOMAIN');
  }
  if (!PORT) {
      throw new Error(ERRORMSG + 'PORT');
  }
  if (!BASE_URL) {
      throw new Error(ERRORMSG + 'BASE_URL');
  }
  if (!MINT_URL) {
      throw new Error(ERRORMSG + 'MINT_URL');
  }
  if (!JWT_SECRET) {
      throw new Error(ERRORMSG + 'JWT_SECRET');
  }
  if (!LIGHTNING_ADDRESS) {
      throw new Error(ERRORMSG + 'LIGHTNING_ADDRESS');
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
    jwtSecret: JWT_SECRET,
    lightningAddress: LIGHTNING_ADDRESS,
  };
}
