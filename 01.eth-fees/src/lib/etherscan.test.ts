import { calculateTxStats, TX } from "./etherscan";

describe("calculateTxStats", () => {
  it("should calculate stats for tx list", () => {
    const account = "0x1234567890123456789012345678901234567890";

    const txList: Partial<TX>[] = [
      {
        from: account,
        isError: "0",
        gasUsed: "100",
        gasPrice: "100",
      },
      {
        from: account,
        isError: "0",
        gasUsed: "200",
        gasPrice: "200",
      },
      {
        from: account,
        isError: "1",
        gasUsed: "300",
        gasPrice: "90",
      },
      {
        from: account,
        isError: "0",
        gasUsed: "400",
        gasPrice: "110",
      },
    ];
    expect(calculateTxStats(account, txList as TX[])).toEqual({
      count: 4,
      failedTxs: 1,
      totalGasUsed: 1000,
      failedTotalGasUsed: 300,
      totalGasPrice: 500,
      avgGasPrice: 125,
    });
  });
});
