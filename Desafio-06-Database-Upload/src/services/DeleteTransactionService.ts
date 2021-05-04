import { getCustomRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const dataDelete = await transactionsRepository.findOne({
      where: { id },
    });
    if (dataDelete) {
      await transactionsRepository.remove(dataDelete);
    }
  }
}

export default DeleteTransactionService;
