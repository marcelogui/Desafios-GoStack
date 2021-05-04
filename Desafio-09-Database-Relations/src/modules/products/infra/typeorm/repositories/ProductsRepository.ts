import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    // const productsFound = await this.ormRepository.find({
    //   where: { id: products },
    // });
    const productsFound = await this.ormRepository.findByIds(products);

    return productsFound;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsId: IFindProducts[] = products.map(product => {
      const findProduct: IFindProducts = { id: product.id };
      return findProduct;
    });

    const productsData = await this.findAllById(productsId);

    const updatedProducts = products.map(product => {
      const storeProduct = productsData.find(
        productData => productData.id === product.id,
      );

      if (!storeProduct) {
        throw new AppError('The product was not found.');
      }

      if (storeProduct.quantity < product.quantity) {
        throw new AppError('There is not enough product in the store');
      }

      const updatedProduct: Product = {
        id: storeProduct.id,
        name: storeProduct.name,
        price: storeProduct.price,
        quantity: storeProduct.quantity - product.quantity,
        created_at: storeProduct.created_at,
        updated_at: new Date(),
        order_products: storeProduct.order_products,
      };

      return updatedProduct;
    });

    await this.ormRepository.save(updatedProducts);

    return updatedProducts;
  }
}

export default ProductsRepository;
