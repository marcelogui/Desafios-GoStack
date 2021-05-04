/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import CreateTransactionService from './CreateTransactionService';
import Transaction from '../models/Transaction';

interface TransactionRequest {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();
    const csvFilePath = path.resolve(
      __dirname,
      '..',
      '__tests__',
      'import_template.csv',
    );

    const csvData = await this.loadCSV(csvFilePath);
    const transactions: Transaction[] = [];
    for (const line of csvData) {
      const { title, type, value, category } = line;
      const newTransaction: Transaction = await createTransactionService.execute(
        {
          title,
          type,
          value,
          category,
        },
      );
      transactions.push(newTransaction);
    }

    return transactions;
  }

  private async loadCSV(filepath: string): Promise<TransactionRequest[]> {
    const readCSVStream = fs.createReadStream(filepath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: TransactionRequest[] = [];

    parseCSV.on('data', line => {
      const [title, type, value, category] = line;
      lines.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;
