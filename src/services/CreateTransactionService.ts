import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AddCategoryIdInTransaction1589305704488 from '../database/migrations/1589305704488-AddCategoryIdInTransaction';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError('insufficient balance for this transaction');
    }
    const categoryRepository = getRepository(Category);

    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      transactionCategory = await categoryRepository.save(transactionCategory);
    }

    const createTransaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: transactionCategory.id,
    });

    const transaction = await transactionRepository.save(createTransaction);

    return transaction;
  }
}

export default CreateTransactionService;
