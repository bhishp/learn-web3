import { BigNumber } from "@ethersproject/bignumber";

export const weiToGwei = (wei: number): number => {
  return wei / 1e9;
};

// a naive rounding (will always round down), but at least its MAX_SAFE_INTEGER safe??
export const roundTo = (n: string, decimals = 2): string => {
  const parts = n.split(".");
  if (parts.length === 1) {
    return parts[0];
  }
  return parts[0] + "." + parts[1].substring(0, decimals);
};

// https://ethereum.stackexchange.com/a/97885
export const roundToMethod2 = (wei: BigNumber, decimals = 2): BigNumber =>
  // wei.sub(wei.mod(1e15));
  wei.sub(wei.mod(10 ** (16 - decimals)));
