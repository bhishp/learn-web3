import { calculateTxStats, TX } from "./etherscan";

describe("calculateTxStats", () => {
  it("should calculate stats for tx list", () => {
    const account = "0x1234567890123456789012345678901234567890";

    const txList: Partial<TX>[] = [
      {
        from: account,
        isError: "0",
        gasUsed: "1",
        gasPrice: "100",
      },
      {
        from: account,
        isError: "0",
        gasUsed: "2",
        gasPrice: "200",
      },
      {
        from: account,
        isError: "1",
        gasUsed: "3",
        gasPrice: "100",
      },
      {
        from: account,
        isError: "0",
        gasUsed: "4",
        gasPrice: "100",
      },
    ];
    expect(calculateTxStats(account, txList as TX[])).toEqual({
      count: 4,
      totalGasUsed: 10,
      totalGasPrice: 500,
      avgGasPrice: 125,
      totalFeesPaid: 1200,
      failedTxs: 1,
      failedTotalGasUsed: 3,
      failedTotalFeesPaid: 300,
    });
  });
});
