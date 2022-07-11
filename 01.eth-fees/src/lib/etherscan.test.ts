import { countTotalGasUsed, TX } from "./etherscan";

describe("countTotalGas", () => {
  it("should count total gas for tx list", () => {
    const txList: Partial<TX>[] = [
      {
        gasUsed: "100",
      },
      {
        gasUsed: "200",
      },
      {
        gasUsed: "300",
      },
    ];
    expect(countTotalGasUsed(txList as TX[])).toBe(600);
  });
});
