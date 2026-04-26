import React, { useState } from 'react';
import { Search, Truck, Package, MapPin, CheckCircle2, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { orderService } from '../services/orderService';
import { Order } from '../types';

const STEPS = [
  { id: 'confirmed', label: 'Commande Confirmée', icon: <CheckCircle2 size={20} /> },
  { id: 'processing', label: 'Préparation Par la Coopérative', icon: <Package size={20} /> },
  { id: 'shipped', label: 'En cours de Livraison', icon: <Truck size={20} /> },
  { id: 'delivered', label: 'Livré', icon: <MapPin size={20} /> },
];

export function Tracking() {
  const [searchId, setSearchId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    setSearched(false);
    try {
      const data = await orderService.getOrderById(searchId);
      setOrder(data);
    } catch (err) {
      console.error('Tracking search failed:', err);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const currentStepIndex = order ? STEPS.findIndex(s => s.id === order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black font-serif text-natural-primary">Suivi de Livraison</h1>
        <p className="text-natural-secondary font-medium">Entrez votre numéro de commande pour localiser vos produits du terroir.</p>
      </div>

      <div className="bg-white border border-natural-border p-8 md:p-12 rounded-[48px] shadow-2xl shadow-natural-primary/5">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-secondary" size={20} />
            <input 
              type="text" 
              placeholder="Ex: #TL-847 ou son ID"
              className="w-full bg-natural-bg border border-natural-border pl-14 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-bold uppercase tracking-widest transition-all"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            />
          </div>
          <button 
            disabled={loading}
            className="bg-natural-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-natural-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 min-w-[200px]"
          >
            {loading ? <Clock className="animate-spin" size={18} /> : <>Rechercher <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {searched && order && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="grid md:grid-cols-3 gap-8">
              {/* Status Overview */}
              <div className="md:col-span-2 bg-white border border-natural-border p-10 rounded-[48px] shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary mb-1">État actuel</p>
                    <h2 className="text-2xl font-black text-natural-primary font-serif capitalize">{order.status}</h2>
                  </div>
                  <div className="bg-natural-accent/10 px-4 py-2 rounded-xl text-natural-accent text-xs font-black uppercase tracking-widest">
                    Étape {currentStepIndex + 1}/{STEPS.length}
                  </div>
                </div>

                <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-natural-bg">
                  {STEPS.map((step, i) => (
                    <div key={step.id} className="flex items-start gap-8 relative">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-md",
                        i <= currentStepIndex ? "bg-natural-primary text-white" : "bg-natural-border text-natural-secondary"
                      )}>
                        {step.icon}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className={cn("font-bold", i <= currentStepIndex ? "text-natural-primary" : "text-natural-secondary")}>
                            {step.label}
                          </h3>
                        </div>
                        {i === currentStepIndex && i < 3 && (
                          <p className="text-xs text-natural-secondary font-medium">Votre colis est actuellement à cette étape de traitement.</p>
                        )}
                        {i === 3 && currentStepIndex === 3 && (
                           <p className="text-xs text-natural-secondary font-medium font-serif italic">Déjà entre vos mains ! Merci de votre confiance.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-6">
                <div className="bg-natural-primary text-white p-8 rounded-[40px] shadow-xl shadow-natural-primary/20">
                  <ShieldCheck size={40} className="mb-6 opacity-50" />
                  <h4 className="text-xl font-bold font-serif mb-4">Livraison Garantie</h4>
                  <p className="text-sm opacity-80 leading-relaxed font-medium">
                    Tous nos colis sont transportés dans des conditions de fraîcheur optimales.
                  </p>
                </div>
                
                <div className="bg-white border border-natural-border p-8 rounded-[40px]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-natural-secondary mb-4">Infos Commande</p>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                       <span className="text-xs font-bold text-natural-secondary">Client</span>
                       <span className="text-xs font-black text-natural-primary">{order.full_name.split(' ')[0]}..</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-xs font-bold text-natural-secondary">Zone</span>
                       <span className="text-xs font-black text-natural-primary">{order.neighborhood || 'Sénégal'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {searched && !order && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <AlertCircle size={64} className="text-red-500/20 mb-8" />
            <h3 className="text-2xl font-black font-serif text-natural-primary mb-2">Commande introuvable</h3>
            <p className="text-natural-secondary font-medium max-w-xs mx-auto">Veuillez vérifier l'ID de commande saisi. Si le problème persiste, contactez le support.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
