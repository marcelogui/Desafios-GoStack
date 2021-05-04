import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { ProductImage } from '../pages/Cart/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      try {
        const productsData = await AsyncStorage.getItem('@market:products');
        productsData && setProducts(JSON.parse(productsData));
        // eslint-disable-next-line no-empty
      } catch (err) {}
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async ({ id, title, image_url, price }: Product) => {
      const productInCart = products.find(product => product.id === id);
      if (productInCart) {
        productInCart.quantity += 1;
        setProducts([...products]);
      } else {
        const newProduct = {
          id,
          title,
          image_url,
          price,
          quantity: 1,
        };
        setProducts([...products, newProduct]);
      }
      await AsyncStorage.setItem('@market:products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productInCart = products.find(product => product.id === id);
      if (productInCart) {
        productInCart.quantity += 1;
        setProducts([...products]);
      }
      await AsyncStorage.setItem('@market:products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productInCart = products.find(product => product.id === id);
      if (productInCart && productInCart.quantity > 1) {
        productInCart.quantity -= 1;
        setProducts([...products]);
      }
      await AsyncStorage.setItem('@market:products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
