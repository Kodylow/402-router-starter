import { Elysia } from 'elysia'
import { FedimintClient } from 'fedimint-ts'
import { loadConfigFromEnv } from './config';

const CONFIG = loadConfigFromEnv();

const fedimintClient = new FedimintClient({
    baseUrl: CONFIG.baseUrl,
    password: CONFIG.password,
});

const app = new Elysia()
    .get('/', () => 'Hello Elysia')
    .listen(8080)

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)
