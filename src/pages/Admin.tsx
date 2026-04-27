/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Package, ShoppingBag, TrendingUp, AlertTriangle, CheckCircle, Clock, Truck, Plus, MoreVertical, Edit3, Trash2, Leaf, Loader2, X, User } from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { Order, Product } from '../types';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { supabase } from '../lib/supabase';

// Mock stats pour le dashboard (on garde ces mocks pour les graphiques pour l'instant)
const SALES_DATA = [
  { name: 'Lun', sales: 45000 },
  { name: 'Mar', sales: 52000 },
  { name: 'Mer', sales: 38000 },
  { name: 'Jeu', sales: 65000 },
  { name: 'Ven', sales: 48000 },
  { name: 'Sam', sales: 85000 },
  { name: 'Dim', sales: 92000 },
];

const CATEGORY_STATS = [
  { name: 'Fruits', value: 400, color: '#4A6741' },
  { name: 'Céréales', value: 300, color: '#E67E22' },
  { name: 'Mer', value: 200, color: '#2E86C1' },
  { name: 'Épicerie', value: 150, color: '#D4AC0D' },
];

// Mocks complets pour la simulation (en cas de base vide)
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: "Bissap Rouge", category: "Fleurs & Thé", price: 1500, stock: 50, producer: "Coop Kaolack", description: "Fleurs de bissap séchées de première qualité.", imageUrl: "https://th.bing.com/th/id/R.c0d3c7c4aae4eb38ecde0925bcb60d14?rik=Mtswoo8p%2fYTAzg&pid=ImgRaw&r=0", attributes: {} },
  { id: '2', name: "Huile d'Arachide Pure", category: "Épicerie", price: 1200, stock: 100, producer: "Terroir Pure", description: "Huile pressée à froid, 100% naturelle.", imageUrl: "https://shop.haudecoeur.fr/medias/produitsb2b/middle_square_pate-d-arachide-seaux-4-5-kg-tantie_3276650143078.jpg", attributes: {} },
  { id: '3', name: "Mangues Kent", category: "Fruits", price: 1200, stock: 30, producer: "Casamance", description: "Mangues Kent savoureuses et sucrées.", imageUrl: "https://th.bing.com/th/id/R.21ecfd0af49f46faa8fc7a786b6369e6?rik=WJlxcQ%2bnt9vHLQ&pid=ImgRaw&r=0", attributes: {} },
  { id: '4', name: "Guedj Kong (Fumé)", category: "Mer", price: 2500, stock: 20, producer: "Saly Portudal", description: "Poisson fumé traditionnel pour vos plats.", imageUrl: "https://tse3.mm.bing.net/th/id/OIP.hGgrzmLvu0BAED0NFyigdwHaFe?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '5', name: "Petit Mil", category: "Céréales", price: 800, stock: 80, producer: "Louga Local", description: "Céréale locale riche en nutriments.", imageUrl: "https://www.afriquefemme.com/images/posts/2904/_thumb1/1111111mildongo.jpg", attributes: {} },
  { id: '6', name: "Niébé Blanc", category: "Légumes Secs", price: 950, stock: 60, producer: "Thiès", description: "Haricots locaux, parfaits pour le ndambé.", imageUrl: "https://tse3.mm.bing.net/th/id/OIP.VabmkwiDKjq6L9MmVjWVXQHaEj?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '7', name: "Manioc Frais", category: "Légumes", price: 500, stock: 120, producer: "GIE Local", description: "Tubercules de manioc fraîchement récoltés.", imageUrl: "https://th.bing.com/th/id/R.bd71b56c363110e50b18b7c78ddd11d1?rik=A0VaipD8UR4zbQ&pid=ImgRaw&r=0", attributes: {} },
  { id: '8', name: "Oignons Galmi", category: "Légumes", price: 600, stock: 200, producer: "Niayes", description: "Oignons rouges de qualité supérieure.", imageUrl: "https://tse1.mm.bing.net/th/id/OIP.hZds9E0BZwFbOcNV5bnKqAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '10', name: "Piments Rouges", category: "Légumes", price: 500, stock: 30, producer: "Podor", description: "Piments forts pour relever vos sauces.", imageUrl: "https://tse2.mm.bing.net/th/id/OIP.iR9pYecQiOBzLOYhzwwedAHaF6?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '11', name: "Banane Plantain", category: "Fruits", price: 1200, stock: 50, producer: "Guinée/Casamance", description: "Bananes plantains mûres à point.", imageUrl: "https://tse1.mm.bing.net/th/id/OIP.hBaMQ-O26sC3p8kSH_lw4QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '13', name: "Pâte d'Arachide (Tigadene)", category: "Épicerie", price: 1800, stock: 40, producer: "Mbacké", description: "Pâte riche pour sauce mafé authentique.", imageUrl: "https://shop.haudecoeur.fr/medias/produitsb2b/middle_square_pate-d-arachide-seaux-4-5-kg-tantie_3276650143078.jpg", attributes: {} },
  { id: '15', name: "Bouye (Poudre de Baobab)", category: "Épicerie", price: 1500, stock: 40, producer: "Kaolack", description: "Fruit du baobab en poudre, idéal pour les jus.", imageUrl: "https://tse1.mm.bing.net/th/id/OIP.DudiltXanbmAifxOcWT_AgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '17', name: "Soumbala (Néré)", category: "Épicerie", price: 1000, stock: 50, producer: "Kolda", description: "Condiment traditionnel à base de néré.", imageUrl: "https://tse2.mm.bing.net/th/id/OIP.qcgRLFVr58LYMgR9YNPDvwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '18', name: "Kinkeliba Séché", category: "Fleurs & Thé", price: 1200, stock: 30, producer: "Tambacounda", description: "Feuilles de kinkeliba séchées pour infusion.", imageUrl: "https://tse3.mm.bing.net/th/id/OIP.-Lrv-_B0xlWNechq9tnm0wHaE8?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '19', name: "Ditakh Frais", category: "Fruits", price: 800, stock: 40, producer: "Fatick", description: "Fruit tropical riche en vitamine C.", imageUrl: "https://tse4.mm.bing.net/th/id/OIP.nE6M0GyzKgmk9E57PKQdsgHaH4?rs=1&pid=ImgDetMain&o=7&rm=3", attributes: {} },
  { id: '20', name: "Miel de Mangrove", category: "Miel", price: 5000, stock: 15, producer: "Delta Saloum", description: "Miel rare récolté dans les mangroves du Saloum.", imageUrl: "https://th.bing.com/th/id/R.b51480ba470412a29c43068d73e95024?rik=MC%2fjPK%2fVfMV3pQ&riu=http%3a%2f%2fwww.lemielsauvage.com%2f119-thickbox_default%2fmiel-des-mangroves.jpg&ehk=As9MoOC4NVVYnqqV9iytqyZ1DMOaJs6pMsDOLEJ06F0%3d&risl=&pid=ImgRaw&r=0", attributes: {} }
];

export function Admin() {
  const [activeView, setActiveView] = useState<'dashboard' | 'products' | 'orders' | 'stats'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Fruits',
    price: 0,
    stock: 0,
    producer: '',
    description: '',
    imageUrl: ''
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      try {
        const added = await productService.createProduct(newProduct);
        if (added) {
          setProducts(prev => [added, ...prev]);
        }
      } catch (err) {
        console.warn("Supabase not fully configured for products, inserting into local state", err);
        const addedLocal = { ...newProduct, id: `temp-${Date.now()}`, attributes: {} };
        setProducts(prev => [addedLocal, ...prev]);
      }
      setShowAddProduct(false);
      setNewProduct({ name: '', category: 'Fruits', price: 0, stock: 0, producer: '', description: '', imageUrl: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersData, productsData] = await Promise.all([
          orderService.getAllOrders(),
          productService.getAll()
        ]);
        setOrders(ordersData);
        if (productsData && productsData.length > 0) {
          setProducts(productsData);
        } else {
          setProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.error('Admin data fetch failed:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSales = (orders || []).reduce((acc, o) => acc + (Number(o?.total_amount) || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 size={40} className="animate-spin text-natural-primary" />
        <p className="text-sm font-black uppercase tracking-widest text-natural-secondary">Chargement de la console...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Sidebar Admin */}
      <aside className="w-full lg:w-72 space-y-3 lg:sticky lg:top-8 self-start">
        <div className="bg-white border border-natural-border p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] shadow-sm mb-6 overflow-x-auto no-scrollbar lg:overflow-visible">
           <p className="hidden lg:block text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary mb-4 px-3">Espace Gestion</p>
           <div className="flex lg:flex-col gap-2 min-w-max lg:min-w-0">
             {[
               { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
               { id: 'products', label: 'Catalogue', icon: <Package size={20} /> },
               { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={20} /> },
               { id: 'stats', label: 'Statistiques', icon: <TrendingUp size={20} /> },
             ].map((view) => (
               <button 
                 key={view.id}
                 onClick={() => setActiveView(view.id as any)}
                 className={cn(
                   "flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold transition-all text-xs lg:text-sm group whitespace-nowrap", 
                   activeView === view.id 
                     ? "bg-natural-primary text-white shadow-lg lg:shadow-xl lg:shadow-natural-primary/20" 
                     : "bg-natural-bg/50 lg:bg-transparent text-natural-secondary hover:bg-natural-bg hover:text-natural-primary"
                 )}
               >
                 <div className={cn("transition-transform group-hover:scale-110", activeView === view.id ? "text-white" : "text-natural-primary")}>
                   {view.icon}
                 </div>
                 {view.label}
               </button>
             ))}
           </div>
        </div>

        <div className="hidden lg:block bg-natural-accent text-white p-6 rounded-[32px] shadow-xl shadow-natural-accent/10 relative overflow-hidden">
           <div className="relative z-10">
             <h4 className="text-lg font-bold font-serif mb-2 leading-none">Aide Admin</h4>
             <p className="text-[10px] opacity-80 mb-6 font-medium">Contacter le support coopérative</p>
             <button className="w-full bg-white text-natural-accent py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                Appeler +221 ...
             </button>
           </div>
           <Leaf size={100} className="absolute bottom-[-20px] right-[-20px] text-white/10 -rotate-12" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-12">
        {activeView === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-natural-border pb-8 gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl lg:text-4xl font-black font-serif text-natural-primary">Tableau de Bord</h1>

                </div>
                <p className="text-sm text-natural-secondary font-medium mt-1">Surveillez la croissance du terroir</p>
              </div>
              <div className="flex gap-3">
                 <button className="p-3 lg:p-4 bg-white border border-natural-border rounded-xl lg:rounded-2xl text-natural-primary hover:bg-natural-bg transition-all">
                    <Clock size={18} />
                 </button>
                 <button className="p-3 lg:p-4 bg-white border border-natural-border rounded-xl lg:rounded-2xl text-natural-primary hover:bg-natural-bg transition-all">
                    <Plus size={18} />
                 </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {/* Featured Stat: Turnover */}
              <div className="lg:col-span-2 bg-natural-primary p-8 lg:p-10 rounded-[32px] lg:rounded-[48px] shadow-2xl shadow-natural-primary/20 text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                      <TrendingUp size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Chiffre d'Affaires Global</p>
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">{formatPrice(totalSales)}</h2>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">En temps réel</span>
                    </div>
                    <p className="text-xs font-medium opacity-60">Basé sur {orders.length} ventes</p>
                  </div>
                </div>
                <Leaf size={180} className="absolute top-[-40px] right-[-40px] text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
              </div>

              {/* Other Stats */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4 lg:gap-8">
                {[
                  { label: 'Commandes', val: (orders?.length || 0).toString(), icon: <ShoppingBag size={20} />, color: 'bg-natural-accent', textColor: 'text-white' },
                  { label: 'Ruptures', val: (products || []).filter(p => p.stock < 5).length.toString().padStart(2, '0'), icon: <AlertTriangle size={20} />, color: 'bg-red-500', textColor: 'text-white' },
                  { label: 'Produits', val: (products?.length || 0).toString(), icon: <CheckCircle size={20} />, color: 'bg-white', textColor: 'text-natural-primary' },
                  { label: 'Clients', val: "12", icon: <User size={20} />, color: 'bg-white', textColor: 'text-natural-primary' }
                ].map((s, i) => (
                  <div key={i} className={cn("p-6 lg:p-8 rounded-[32px] border border-natural-border shadow-sm group hover:shadow-xl transition-all", s.color)}>
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 shadow-lg", s.color === 'bg-white' ? "bg-natural-bg" : "bg-white/20")}>
                      {React.cloneElement(s.icon as React.ReactElement, { size: 18, className: s.color === 'bg-white' ? 'text-natural-primary' : 'text-white' })}
                    </div>
                    <div>
                      <p className={cn("text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 lg:mb-2", s.textColor === 'text-white' ? 'opacity-70' : 'text-natural-secondary')}>{s.label}</p>
                      <p className={cn("text-2xl lg:text-3xl font-black tracking-tighter", s.textColor)}>{s.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
               <div className="xl:col-span-2 bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-natural-border shadow-sm">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-bold font-serif text-natural-primary">Évolution des Ventes</h3>
                    <div className="flex gap-2">
                       <span className="w-3 h-3 rounded-full bg-natural-primary" />
                       <span className="text-[10px] font-black uppercase text-natural-secondary">Revenus Semaine</span>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SALES_DATA}>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f0f0e8" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8a8a75', fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8a8a75', fontWeight: 'bold' }} />
                        <Tooltip cursor={{ fill: '#f5f5f0' }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(90 90 64 / 0.15)', padding: '16px' }} />
                        <Bar dataKey="sales" fill="#5a5a40" radius={[12, 12, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[48px] border border-natural-border shadow-sm flex flex-col">
                  <h3 className="text-xl font-bold font-serif text-natural-primary mb-10">Par Catégorie</h3>
                  <div className="flex-1 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={CATEGORY_STATS}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          {CATEGORY_STATS.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-3xl font-black text-natural-primary">85%</p>
                       <p className="text-[9px] font-black uppercase text-natural-secondary tracking-widest leading-none">Ventes Bio</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    {CATEGORY_STATS.map((c) => (
                      <div key={c.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-[10px] font-black text-natural-secondary uppercase">{c.name}</span>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
            
            {/* Recent Orders Table */}
            <div className="bg-white p-4 lg:p-10 rounded-[24px] lg:rounded-[48px] border border-natural-border shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 lg:mb-10 gap-4">
                <h3 className="text-xl font-bold font-serif text-natural-primary">Commandes Récentes</h3>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-primary border-b-2 border-natural-primary/20 hover:border-natural-primary pb-1 font-sans transition-all">Rapport Mensuel</button>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="text-[10px] font-black text-natural-secondary uppercase tracking-[0.2em] border-b border-natural-bg">
                      <th className="pb-6">ID Commande</th>
                      <th className="pb-6">Client</th>
                      <th className="pb-6">Statut</th>
                      <th className="pb-6">Total</th>
                      <th className="pb-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-natural-bg/50">
                    {(orders || []).slice(0, 5).map((o) => (
                      <tr key={o.id} className="group hover:bg-natural-bg/30 transition-all">
                        <td className="py-8 font-black text-natural-primary text-sm truncate max-w-[100px]">#{o.id.slice(0, 6)}</td>
                        <td className="py-8">
                          <p className="font-bold text-natural-text text-sm mb-0.5">{o.full_name}</p>
                          <p className="text-[10px] text-natural-secondary font-medium tracking-widest uppercase">{o.neighborhood || 'Dakar'}</p>
                        </td>
                        <td className="py-8">
                           <select 
                             className={cn(
                               "text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-[0.2em] shadow-sm appearance-none cursor-pointer outline-none transition-all",
                               o.status === 'confirmed' ? "bg-green-100/50 text-green-700 hover:bg-green-100" :
                               o.status === 'processing' ? "bg-orange-100/50 text-orange-700 hover:bg-orange-100" :
                               o.status === 'shipped' ? "bg-blue-100/50 text-blue-700 hover:bg-blue-100" : "bg-gray-100 text-gray-700"
                             )}
                             value={o.status}
                             onChange={async (e) => {
                               const newStatus = e.target.value;
                               try {
                                 const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', o.id);
                                 if (error) throw error;
                                 setOrders(prev => prev.map(ord => ord.id === o.id ? { ...ord, status: newStatus } : ord));
                               } catch (err) {
                                 console.error('Status update failed:', err);
                               }
                             }}
                           >
                             <option value="confirmed">Confirmée</option>
                             <option value="processing">En Préparation</option>
                             <option value="shipped">Expédiée</option>
                             <option value="delivered">Livrée</option>
                           </select>
                        </td>
                        <td className="py-8 font-black text-natural-primary text-lg">{formatPrice(o.total_amount)}</td>
                        <td className="py-8 text-right pr-4">
                           <button className="p-4 bg-natural-bg/50 hover:bg-natural-bg text-natural-primary rounded-2xl transition-all">
                              <MoreVertical size={18} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeView === 'products' && (
           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-natural-border pb-8 gap-4">
                 <div>
                    <h1 className="text-3xl lg:text-4xl font-black font-serif text-natural-primary">Catalogue Stock</h1>
                    <p className="text-sm text-natural-secondary font-medium mt-1">Mise à jour des récoltes</p>
                 </div>
                 <button onClick={() => setShowAddProduct(true)} className="w-full sm:w-auto bg-natural-accent text-white px-6 lg:px-8 py-4 lg:py-5 rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl shadow-natural-accent/20">
                    <Plus size={18} />
                    Ajouter un produit
                 </button>
              </div>

              <div className="bg-white rounded-[48px] border border-natural-border overflow-x-auto shadow-2xl shadow-natural-primary/5">
                 <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-natural-bg/30">
                       <tr className="text-[10px] font-black text-natural-secondary uppercase tracking-[0.2em]">
                          <th className="p-8">Produit Terroir</th>
                          <th className="p-8">Catégorie</th>
                          <th className="p-8">Stock Restant</th>
                          <th className="p-8">Prix Unitaire</th>
                          <th className="p-8">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-bg/50">
                       {(products || []).map((p, i) => (
                         <tr key={p.id} className="hover:bg-natural-bg/10 transition-colors">
                            <td className="p-8">
                               <p className="font-bold font-serif text-lg text-natural-primary mb-1">{p.name}</p>
                               <span className="text-[9px] font-black uppercase text-natural-secondary tracking-widest bg-natural-bg px-2 py-0.5 rounded">ID: {p.id.slice(0, 6)}</span>
                            </td>
                            <td className="p-8">
                               <span className="text-xs font-black uppercase text-natural-primary/70">{p.category}</span>
                            </td>
                            <td className="p-8">
                               <div className={cn(
                                 "flex items-center gap-3 px-4 py-2 rounded-2xl w-fit font-black text-sm",
                                 p.stock < 5 ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
                               )}>
                                 {p.stock} Unités
                                 {p.stock < 5 && <AlertTriangle size={16} />}
                               </div>
                            </td>
                            <td className="p-8 font-black text-natural-primary text-xl">{formatPrice(p.price)}</td>
                            <td className="p-8">
                               <div className="flex items-center gap-3">
                                  <button className="p-4 bg-natural-bg text-natural-primary hover:bg-natural-primary hover:text-white rounded-2xl transition-all shadow-sm"><Edit3 size={18} /></button>
                                  <button className="p-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={18} /></button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {activeView === 'orders' && (
           <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-natural-border pb-8 gap-4">
                 <div>
                    <h1 className="text-3xl lg:text-4xl font-black font-serif text-natural-primary">Toutes les Commandes</h1>
                    <p className="text-sm text-natural-secondary font-medium mt-1">Gérez les livraisons en cours</p>
                 </div>
              </div>

              <div className="bg-white rounded-[24px] lg:rounded-[48px] border border-natural-border overflow-x-auto no-scrollbar shadow-2xl shadow-natural-primary/5">
                 <table className="w-full text-left min-w-[900px]">
                    <thead className="bg-natural-bg/30">
                       <tr className="text-[10px] font-black text-natural-secondary uppercase tracking-[0.2em]">
                          <th className="p-8">ID</th>
                          <th className="p-8">Client</th>
                          <th className="p-8">Lieu</th>
                          <th className="p-8">Items</th>
                          <th className="p-8">Total</th>
                          <th className="p-8">Statut</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-natural-bg/50">
                       {(orders || []).map((o) => (
                         <tr key={o.id} className="hover:bg-natural-bg/10 transition-colors">
                            <td className="p-8 font-black text-xs">#{o.id.slice(0, 8)}</td>
                            <td className="p-8 font-bold text-sm">{o.full_name}</td>
                            <td className="p-8 text-xs font-medium text-natural-secondary">{o.neighborhood}, {o.address.split(',').pop()}</td>
                            <td className="p-8 text-xs font-black">{o.items?.length || 0} art.</td>
                            <td className="p-8 font-black text-lg">{formatPrice(o.total_amount)}</td>
                            <td className="p-8">
                               <span className={cn(
                                 "text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-[0.2em]",
                                 o.status === 'confirmed' ? "bg-green-100/50 text-green-700" :
                                 o.status === 'shipped' ? "bg-blue-100/50 text-blue-700" : "bg-orange-100/50 text-orange-700"
                               )}>
                                 {o.status}
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>

      {/* Modal Ajout Produit */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 bg-natural-primary/30 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-10 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black font-serif text-natural-primary">Ajouter un produit</h2>
              <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-natural-bg rounded-xl transition-all">
                <X size={24} className="text-natural-secondary" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">Nom du produit</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 outline-none" placeholder="Ex: Mangues Kent" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">Catégorie</label>
                  <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 outline-none">
                    <option value="Fruits">Fruits</option>
                    <option value="Légumes">Légumes</option>
                    <option value="Céréales">Céréales</option>
                    <option value="Épicerie">Épicerie</option>
                    <option value="Mer">Produits de la mer</option>
                    <option value="Fleurs & Thé">Fleurs & Thé</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">Prix Unitaire (FCFA)</label>
                  <input required type="number" min="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">Stock Initial</label>
                  <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 outline-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">Producteur / Origine</label>
                  <input required type="text" value={newProduct.producer} onChange={e => setNewProduct({...newProduct, producer: e.target.value})} className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 outline-none" placeholder="Ex: Coopérative de Niayes" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">URL de l'Image</label>
                  <input required type="url" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 outline-none" placeholder="https://..." />
                  {newProduct.imageUrl && (
                    <div className="mt-4 flex justify-center">
                      <img src={newProduct.imageUrl} alt="Aperçu" className="w-32 h-32 object-cover rounded-2xl border border-natural-border shadow-sm" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                    </div>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">Description</label>
                  <textarea required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 outline-none h-24 resize-none" placeholder="Description du produit..."></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowAddProduct(false)} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-natural-bg text-natural-secondary hover:bg-natural-border transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-natural-primary text-white shadow-xl shadow-natural-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
