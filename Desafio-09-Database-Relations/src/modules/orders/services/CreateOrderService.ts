import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

interface IFindProducts {
  id: string;
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('The customer was not found.');
    }

    const products_id: IFindProducts[] = [];
    products.forEach(product => {
      products_id.push({ id: product.id });
    });

    const productsList = await this.productsRepository.findAllById(products_id);

    const productsOrder = products.map(product => {
      const product_data = productsList.find(
        product_list => product_list.id === product.id,
      );
      if (!product_data) {
        throw new AppError('The listed product was not found.');
      }
      const productInfo = {
        product_id: product.id,
        quantity: product.quantity,
        price: product_data.price,
      };

      return productInfo;
    });

    await this.productsRepository.updateQuantity(products);

    const order = this.ordersRepository.create({
      customer,
      products: productsOrder,
    });

    return order;
  }
}

export default CreateOrderService;
