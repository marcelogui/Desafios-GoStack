import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import AppError from '@shared/errors/AppError';
import Order from '../entities/Order';
import OrdersProducts from '../entities/OrdersProducts';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  private ormOrdersProducts: Repository<OrdersProducts>;

  constructor() {
    this.ormRepository = getRepository(Order);
    this.ormOrdersProducts = getRepository(OrdersProducts);
  }

  public async create({ customer, products }: ICreateOrderDTO): Promise<Order> {
    const order = this.ormRepository.create({
      customer,
    });

    await this.ormRepository.save(order);

    const ordersProducts: OrdersProducts[] = [];
    products.forEach(product => {
      ordersProducts.push(
        this.ormOrdersProducts.create({
          product_id: product.product_id,
          quantity: product.quantity,
          price: product.price,
          order_id: order.id,
        }),
      );
    });

    await this.ormOrdersProducts.save(ordersProducts);

    return order;
  }

  public async findById(id: string): Promise<Order | undefined> {
    const order = await this.ormRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new AppError('The order was not found.');
    }

    const ordersProducts: OrdersProducts[] = await this.ormOrdersProducts.find({
      select: [
        'product_id',
        'price',
        'quantity',
        'order_id',
        'id',
        'created_at',
        'updated_at',
      ],
      where: { order_id: id },
    });

    order.order_products = ordersProducts;

    return order;
  }
}

export default OrdersRepository;
