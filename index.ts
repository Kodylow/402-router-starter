import { Elysia } from 'elysia'
import { FedimintClient } from 'fedimint-ts'

const fedimintClient = new FedimintClient({
    baseUrl: 'https://localhost:5000',
    password: 'password',
});


const app = new Elysia()
    .get('/', () => 'Hello Elysia')
    .listen(8080)

console.log(`🦊 Elysia is running at on port ${app.server?.port}...`)
