import { getDecodedToken, TokenEntry } from "@cashu/cashu-ts";

import { CLIENTS, CONFIG } from "..";

export const middleware_cashu = async (
  xCashuHeader: string,
  exactAmount: number,
): Promise<boolean> => {
  try {
    const token = tokenIsValid(xCashuHeader, exactAmount);
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
