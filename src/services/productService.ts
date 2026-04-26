import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const productService = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    return data as Product[];
  },

  async getByCategory(category: string): Promise<Product[]> {
    const query = supabase.from('products').select('*');
    
    if (category !== 'Tous') {
      query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return data as Product[];
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .insert([
        {
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          producer: product.producer,
          description: product.description,
          image_url: product.imageUrl,
          attributes: product.attributes || {}
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return data ? {
      ...data,
      imageUrl: data.image_url
    } as Product : null;
  }
};
