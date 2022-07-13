import { BigNumber } from "@ethersproject/bignumber";
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
      totalGasUsed: BigNumber.from("10"),
      totalGasPrice: BigNumber.from("500"),
      avgGasPrice: BigNumber.from("125"),
      totalFeesPaid: BigNumber.from("1200"),
      failedTxsCount: 1,
      failedTotalGasUsed: BigNumber.from("3"),
      failedTotalFeesPaid: BigNumber.from("300"),
    });
  });
});
