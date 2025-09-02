import { Address, Clause, TransactionClause, VET } from "@vechain/sdk-core";

export const sendVETClauses: TransactionClause[] = [
  Clause.transferVET(
    Address.of("0x9199828f14cf883c8d311245bec34ec0b51fedcb"),
    VET.of(0.1)
  ) as TransactionClause,
];
