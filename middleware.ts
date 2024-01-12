import { getDecodedToken, TokenEntry, getEncodedToken } from "@cashu/cashu-ts";

export const middleware_fedimint = (xFedimintHeader: string): boolean => {
  return true;
};

export const middleware_cashu = async (
  xCashuHeader: string,
  exactAmount: number,
): Promise<boolean> => {
  // Decode to a cashu token
  // Check the token is valid and for exact amount

  // TODO: implement error handling for "Token already spent"
  // May need to use `checkProofsSpent` for this ^^
  const checkToken = (xCashuHeader: string) => {
    try {
      const { token } = getDecodedToken(xCashuHeader);
      let totalAmount = 0;
      token.forEach((entry: TokenEntry) => {
        entry.proofs.forEach((proof) => {
          totalAmount += proof.amount;
        });
      });
      if (totalAmount === exactAmount) {
        // returns token if valid and for exact amount
        console.log("token valid and for exact amount");
        return token;
      }
      // returns false if token valid but not for exact amount
      console.log("token valid but not for exact amount");
      return false;
    } catch (e) {
      // returns false if token is invalid
      console.log("token invalid");
      return false;
    }
  };

  // Try to reissue the token against the mintUrl
  try {
    const token = checkToken(xCashuHeader);
    console.log("token", token);

    if (token) {
      const encoded = getEncodedToken({
        token,
      });
      // returns true if reissue succeeds
      console.log(encoded);
      console.log("reissue succeeds");
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

export const middleware_l402 = (authorizationHeader: string): boolean => {
  return true;
};
