import { getDecodedToken, TokenEntry } from "@cashu/cashu-ts";

import { CLIENTS, CONFIG } from "..";

/**
 * X-Cashu is a single round push payment.
 * The client sends an encoded cashu token in the header for the exact amount of the route
 * "X-Cashu: cashuAeyJ0b2tlbiI6W3sicHJvb2ZzIjpbeyJpZCI6IkkyeU4raVJZZmt6VCIsImFtb3VudCI6MSwiQyI6IjAyZTc2ZTE3ZWM0MTVjNjk5YzAzYjAxYWRlY2Q3ZjMwOThlNmVmMjk3ODBmYWE5ZGZlZmQ1NGVkNWNmNjVmOTE1YiIsInNlY3JldCI6ImpUcWdQNDEwaHZ2WllKMnplZGtWNVhsbnUvSkxBMVRXTlZMWFhEOHc4MHM9In1dLCJtaW50IjoiaHR0cHM6Ly84MzMzLnNwYWNlOjMzMzgifV19"
 * 
 * The token's proofs MUST match the configured mintURL.
 * The token's amount MUST match the exact route cost. (If overpaid or underpaid, just don't redeem and throw an error)
 * 
 * The server MUST redeem the token for the exact amount of the route.
 * 
 * Extremely useful for one time payments like a single API call.
 * Server can be completely stateless, all state management is done by the mint.
 * 
 * @param encodedToken 
 * @param exactRouteCost 
 * @returns boolean
 */
export const middleware_cashu = async (
  xCashuHeader: string,
  exactRouteCost: number,
): Promise<boolean> => {
  try {
    const token = tokenIsValid(xCashuHeader, exactRouteCost);
    console.log("token", token);

    if (token) {
      const { tokensWithErrors } = await CLIENTS.cashu.receive(xCashuHeader);
      console.log(!!tokensWithErrors);
      if (tokensWithErrors) {
        console.log("tokensWithErrors", tokensWithErrors);
        return false;
      }
      return true;
    }

    // returns false of token is invalid or not for exact amount
    console.log("token invalid or not for exact amount");
    return false;

    // returns false if reissue fails
  } catch (e) {
    console.log("error", e);
    console.log("reissue fails");
    return false;
  }
};

const tokenIsValid = (xCashuHeader: string, exactAmount: number) => {
  // pull into separate helper function
  try {
    const { token } = getDecodedToken(xCashuHeader);
    let totalAmount = 0;
    token.forEach((entry: TokenEntry) => {
      entry.proofs.forEach((proof) => {
        totalAmount += proof.amount;
      });
    });
    return totalAmount === exactAmount;
  } catch (e) {
    // returns false if token is invalid
    console.log("token invalid");
    return false;
  }
};

export class Cashu402 {
  mintUrl: string;
  amount: number;

  constructor(amount: number) {
    this.mintUrl = CONFIG.mintUrl;
    this.amount = amount;
  }

  to_string(): string {
    return `Cashu402 mintUrl='${this.mintUrl}', amount='${this.amount}'`;
  }
}
