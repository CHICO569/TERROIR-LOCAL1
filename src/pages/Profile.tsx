import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { orderService } from '../services/orderService';
import { formatPrice, cn } from '../lib/utils';
import { Package, Truck, CheckCircle2, Clock, MapPin, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const data = await orderService.getOrdersByUserId(user.id);
        setOrders(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des commandes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-12 rounded-[40px] border border-natural-border shadow-xl shadow-natural-primary/5">
        <div className="w-24 h-24 rounded-full bg-natural-accent flex items-center justify-center text-white text-3xl font-black shadow-lg">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-4xl font-black font-serif text-natural-primary mb-2">Mon Profil</h1>
          <p className="text-natural-secondary font-medium text-lg">{user?.user_metadata?.full_name || user?.email}</p>
          <span className="inline-block mt-4 px-4 py-2 bg-natural-bg rounded-xl text-xs font-black uppercase tracking-widest text-natural-primary">
            Membre Coopérative
          </span>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-black font-serif text-natural-primary border-b border-natural-border pb-4">Historique des Commandes</h2>
        
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
             <Loader2 size={40} className="animate-spin text-natural-primary" />
             <p className="text-xs font-black uppercase tracking-widest text-natural-secondary">Recherche de vos commandes...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] border border-natural-border text-center shadow-sm">
            <Package size={48} className="mx-auto text-natural-secondary/30 mb-6" />
            <p className="text-xl font-bold text-natural-primary mb-2">Aucune commande pour le moment</p>
            <p className="text-sm text-natural-secondary font-medium">Découvrez nos produits du terroir dans la boutique.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-natural-border p-8 rounded-[32px] shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black font-serif text-natural-primary">Commande #{order.id.slice(0, 8)}</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        order.status === 'confirmed' ? "bg-green-100 text-green-700" :
                        order.status === 'processing' ? "bg-orange-100 text-orange-700" :
                        order.status === 'shipped' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      )}>
                        {order.status === 'confirmed' ? 'Confirmée' : order.status === 'processing' ? 'En préparation' : order.status === 'shipped' ? 'Expédiée' : order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-natural-secondary font-medium">
                      <span className="flex items-center gap-2"><Clock size={14} /> {new Date(order.created_at || Date.now()).toLocaleDateString('fr-FR')}</span>
                      <span className="flex items-center gap-2"><MapPin size={14} /> {order.neighborhood || 'Dakar'}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center md:text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-natural-secondary mb-1">Total Payé</p>
                      <p className="text-2xl font-black text-natural-primary">{formatPrice(order.total_amount)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
