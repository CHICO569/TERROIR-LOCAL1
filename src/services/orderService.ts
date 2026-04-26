import { supabase } from '../lib/supabase';
import { OrderItem, DeliveryInfo, Order } from '../types';

export const orderService = {
  async createOrder(items: OrderItem[], total: number, delivery: DeliveryInfo, paymentMethod: string, userId?: string) {
    const orderData: any = {
      total_amount: total,
      full_name: delivery.fullName,
      phone: delivery.phone,
      email: delivery.email,
      address: `${delivery.address}${delivery.city ? `, ${delivery.city}` : ''}`,
      neighborhood: delivery.neighborhood,
      shipping_method: delivery.shippingMethod,
      instructions: delivery.instructions,
      status: 'confirmed',
      payment_method: paymentMethod
    };

    // Only add user_id if it's provided, to avoid schema errors if the column is missing
    if (userId) {
      orderData.user_id = userId;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }

    return order;
  },

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    // Map DB fields to Order type
    return (data || []).map(row => ({
      ...row,
      items: row.order_items // Supabase joins them as an array
    })) as Order[];
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const cleanId = orderId.replace('#', '').replace('TL-', '').trim();
    
    // Attempt to find by ID or partial ID if it's not a full UUID
    // We use ilike to allow partial matches on the UUID which is what TL- prefix often points to
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`id.eq.${cleanId},id.ilike.%${cleanId}%`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching order by ID:', error);
      return null;
    }

    return {
      ...data,
      items: data.order_items
    } as Order;
  },

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by user ID:', error);
      return [];
    }

    return (data || []).map(row => ({
      ...row,
      items: row.order_items
    })) as Order[];
  }
};
