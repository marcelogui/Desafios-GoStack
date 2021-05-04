import { Router } from 'express';
import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const categoriesRepository = getRepository(Category);
  const transactions = await transactionsRepository.find();
  const completeTransactions = await Promise.all(
    transactions.map(async transaction => {
      const {
        id,
        title,
        value,
        type,
        category_id,
        created_at,
        updated_at,
      } = transaction;
      const category = await categoriesRepository.findOne({ id: category_id });

      const newTransaction = {
        id,
        title,
        value,
        type,
        category,
        created_at,
        updated_at,
      };

      return newTransaction;
    }),
  );
  const balance = await transactionsRepository.getBalance();
  const transactionsBalance = {
    transactions: completeTransactions,
    balance,
  };
  return response.json(transactionsBalance);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteId = request.params.id;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(deleteId);

  return response.status(204).json();
});

transactionsRouter.post('/import', async (request, response) => {
  const importTransactionsService = new ImportTransactionsService();
  const transactionsImported = await importTransactionsService.execute();
  return response.json(transactionsImported);
});

export default transactionsRouter;
