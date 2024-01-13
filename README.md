# Bitcoin Payment Middleware for API Calls

This project showcases different Bitcoin-based payment methods for accessing API services. The payment methods are categorized into Ecash and Lightning, each suitable for various use cases.

## Ecash

Ecash payments are handled through chaumian mint systems like Cashu and Fedimint, which provide privacy and scalability. They are ideal for paying for individual API calls, because you just include the ecash in the header which is validated and redeemed by the server prior to processing the request.

### Cashu (`/src/middleware/Cashu.ts`)

- Implements a single round push payment system using encoded tokens.
- Clients send a cashu token for an exact amount in the request' "X-Cashu" header, which the server must validate and redeem.
- **Validation**: Token proofs must match the configured mint URL, and the token amount must be equal to the exact route cost.

### Fedimint (`/src/middleware/Fedimint.ts`)

- TO DEFINE

## Lightning

Lightning payments use the L402 protocol, which is ideal for sessions or API keys that have a validity period.

### L402 (`/src/middleware/L402.ts`)

- **Description**: A protocol for paying for a session or API key valid for a certain time frame.
- **Operation**: The server returns a `WWW-Authenticate` header with a token and an invoice. The client pays the invoice, receives a preimage, and sends it back with the token in the `Authorization` header.
- **Validation**: The server checks if the hash of the preimage matches the payment hash in the token. The token may include additional caveats like expiry time or number of uses.

Integrating these middlewares into your API server allows for the processing of microtransactions using Bitcoin, offering a range of payment options to developers and users alike.

## Setup

Install nix

```bash
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

In this directory, run

```bash
nix develop
```

Which will throw you into the nix shell with all the dependencies you need to run the project.

## Running

```bash
bun run dev
```
