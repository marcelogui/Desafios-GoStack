import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions.reduce((accumulator, transaction) => {
      if (transaction.type === 'income') {
        return accumulator + transaction.value;
      }
      return accumulator;
    }, 0);

    const outcome = transactions.reduce((accumulator, transaction) => {
      if (transaction.type === 'outcome') {
        return accumulator + transaction.value;
      }
      return accumulator;
    }, 0);

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
