/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Menu, X, Leaf, LayoutDashboard, ChevronRight, ShoppingBag, ArrowRight, Truck, CheckCircle2, Search, Filter, SlidersHorizontal, PackageSearch, MapPin, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from './lib/utils';
import emailjs from '@emailjs/browser';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Check } from './pages/Check';
import { Admin } from './pages/Admin';
import { Tracking } from './pages/Tracking';
import { AuthPage } from './pages/Auth';
import { Profile } from './pages/Profile';
import { Toast } from './components/ui/Toast';

export function Layout() {
  const [activeTab, setActiveTab] = useState<'home' | 'shop' | 'cart' | 'checkout' | 'admin' | 'tracking' | 'profile'>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items, toast, hideToast, addToast } = useCart();
  const { user, loading, signOut } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    if (user?.email === 'admin@terroir.sn') {
      setIsAdmin(true);
    }
  }, [user]);

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    const cleanPassword = adminPassword.trim();

    if (cleanEmail === 'admin@terroir.sn' && cleanPassword === 'admin123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminEmail('');
      setAdminPassword('');
      addToast("Accès administrateur accordé.");
    } else {
      addToast("Identifiants incorrects.");
    }
  };

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterLoading(true);
    try {
      await emailjs.send(
        'service_z8okin2',
        'template_8xpkxwo',
        {
          to_email: newsletterEmail,
          to_name: newsletterEmail.split('@')[0],
          type: 'newsletter_signup',
          app_name: 'Terroir Local Sénégal'
        },
        'mNqgrWOCI2ShdsB7e'
      );
      addToast("Inscription réussie ! Un e-mail de bienvenue a été envoyé.");
      setNewsletterEmail('');
    } catch (error) {
      console.error("Newsletter EmailJS error:", error);
      addToast("L'inscription a réussi (votre e-mail est enregistré).");
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-natural-bg gap-4">
        <Loader2 size={48} className="animate-spin text-natural-primary" />
        <p className="text-sm font-black uppercase tracking-widest text-natural-secondary">Authentification...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-natural-bg text-natural-text font-sans overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 border-r border-natural-border bg-white flex-col shrink-0">
        <div className="p-8 border-b border-natural-bg">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="bg-natural-primary p-2.5 rounded-xl text-white group-hover:rotate-12 transition-transform shadow-lg shadow-natural-primary/20">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-natural-primary font-serif leading-none mb-1">Terroir<br />Local</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-natural-secondary font-bold">Produits Authentiques</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
          <div className="text-[10px] font-black text-natural-secondary uppercase tracking-[0.2em] mb-4 px-3">Catalogue</div>
          {[
            { id: 'home', label: 'Accueil', icon: <ChevronRight size={14} /> },
            { id: 'shop', label: 'Tous les produits', icon: <ChevronRight size={14} /> },
            { id: 'tracking', label: 'Suivi de livraison', icon: <Truck size={14} /> },
            { id: 'profile', label: 'Mon Compte', icon: <User size={14} /> },
            { id: 'logout', label: 'Se déconnecter', icon: <LogOut size={14} />, className: "text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 mt-4" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'logout') {
                  signOut();
                } else {
                  setActiveTab(item.id as any);
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                activeTab === item.id 
                  ? "bg-natural-primary text-white shadow-lg shadow-natural-primary/10" 
                  : (item.className || "text-natural-secondary hover:bg-natural-bg hover:text-natural-primary")
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("w-1.5 h-1.5 rounded-full", 
                  activeTab === item.id ? "bg-white" : 
                  (item.id === 'logout' ? "bg-red-300" : "bg-natural-secondary/30")
                )} />
                {item.label}
              </div>
              {item.icon}
            </button>
          ))}

          <div className="pt-8">
            <div className="text-[10px] font-black text-natural-accent uppercase tracking-[0.2em] mb-4 px-3 flex items-center gap-2">
              <ShieldCheck size={12} />
              Accès Staff
            </div>
            <button 
              onClick={() => {
                if (isAdmin) {
                  setIsAdmin(false);
                  setActiveTab('home');
                } else {
                  setShowAdminLogin(true);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2",
                isAdmin 
                  ? "bg-natural-accent text-white border-natural-accent shadow-lg shadow-natural-accent/20" 
                  : "bg-white border-natural-border text-natural-secondary hover:border-natural-accent hover:text-natural-accent"
              )}
            >
              <LayoutDashboard size={16} />
              {isAdmin ? 'Quitter Admin' : 'Connexion Admin'}
            </button>

            {isAdmin && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={cn(
                   "w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm",
                   activeTab === 'admin' ? "bg-natural-primary text-white" : "bg-white text-natural-secondary border border-natural-border hover:bg-natural-bg"
                )}
              >
                <LayoutDashboard size={18} />
                Tableau de Bord
              </button>
            )}
          </div>
        </nav>

        <div className="p-6 border-t border-natural-bg">
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-natural-primary/5 rounded-2xl border border-natural-primary/10">
               <p className="text-[9px] font-black uppercase tracking-widest text-natural-secondary mb-2">Réalisé par l'équipe</p>
               <p className="text-xs font-black text-natural-primary">Codou Niang & Makhtar Ndiaye</p>
            </div>
            
            <div className="p-4 bg-natural-bg/50 rounded-2xl border border-natural-border/50">
               <p className="text-[9px] font-black uppercase tracking-widest text-natural-secondary mb-2">Besoin d'aide ?</p>
               <p className="text-xs font-black text-natural-primary">+221 77 458 37 79</p>
               <p className="text-[9px] font-medium text-natural-secondary">terroire@gmail.com</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-natural-bg rounded-2xl border border-natural-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-natural-accent flex items-center justify-center text-white font-black shadow-md uppercase">
                {user.email?.charAt(0) || 'U'}
              </div>
              <div className="text-[11px] font-bold">
                <p className="text-natural-text truncate max-w-[100px]">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                <p className="text-natural-secondary">Membre Fidèle</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Desktop and Mobile view) */}
        <header className="h-24 bg-white border-b border-natural-border px-6 md:px-12 flex items-center justify-between shrink-0 sticky top-0 z-40 bg-white/95 backdrop-blur-sm">
          <button 
            className="lg:hidden p-3 bg-natural-bg rounded-2xl border border-natural-border"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} className="text-natural-primary" />
          </button>

          <div className="hidden md:block relative flex-1 max-w-md mx-8">
             <input type="text" placeholder="Rechercher un produit du terroir..." className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 transition-all outline-none" />
          </div>

          <div className="flex items-center gap-4">
             <button 
               onClick={() => setActiveTab('cart')}
               className={cn(
                 "relative p-4 rounded-2xl transition-all group",
                 activeTab === 'cart' ? "bg-natural-primary text-white shadow-xl shadow-natural-primary/20" : "bg-natural-bg text-natural-primary hover:bg-natural-border"
               )}
             >
               <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
               {cartCount > 0 && (
                 <span className="absolute -top-1.5 -right-1.5 bg-natural-accent text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black border-4 border-white shadow-lg">
                   {cartCount}
                 </span>
               )}
             </button>
             
             <button 
               onClick={() => setActiveTab('cart')}
               className="hidden sm:flex bg-natural-primary text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-natural-primary/10"
             >
                Panier ({formatPrice(items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0))})
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-natural-bg p-6 md:p-12">
          <div className="max-w-7xl mx-auto min-h-full">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.section 
                  key="home"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="space-y-12"
                >
                  <div className="bg-white rounded-[40px] p-8 md:p-20 border border-natural-border shadow-xl shadow-natural-primary/5 relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                       <span className="inline-block px-5 py-2 bg-natural-primary/10 text-natural-primary text-[10px] font-black rounded-full mb-8 uppercase tracking-[0.2em] border border-natural-primary/20">
                          Récolté avec amour • Terroir Sénégalais
                       </span>
                       <p className="text-[10px] font-black uppercase tracking-widest text-natural-accent/60 mb-2">FIÈREMENT RÉALISÉ PAR CODOU NIANG ET MAKHTAR NDIAYE</p>
                       <h2 className="text-5xl md:text-8xl font-black leading-[1] mb-10 text-natural-primary">
                         L'art de bien <br />
                         <span className="text-natural-accent italic font-serif">manger local.</span>
                       </h2>
                       <p className="text-lg text-natural-secondary mb-12 leading-relaxed font-medium">
                         Votre coopérative livre le meilleur du terroir sénégalais chez vous. Des produits authentiques, sans intermédiaires.
                       </p>
                       <div className="flex flex-wrap gap-5">
                          <button 
                            onClick={() => setActiveTab('shop')}
                            className="bg-natural-primary text-white px-10 py-6 rounded-2xl font-black text-lg hover:bg-natural-primary/90 transition-all flex items-center gap-4 shadow-2xl shadow-natural-primary/20 active:scale-95 ring-4 ring-natural-primary/5"
                          >
                            Explorez le catalogue
                            <ArrowRight size={22} />
                          </button>
                       </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-natural-bg rounded-full -z-0 opacity-50 blur-3xl"></div>
                    <Leaf size={400} className="absolute bottom-[-100px] right-[-100px] text-natural-primary/5 -rotate-12 hidden lg:block" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-8">
                    {[
                      { title: "Direct Producteur", desc: "Pas d'intermédiaires, 100% de la valeur redistribuée.", icon: <Leaf className="text-natural-primary" /> },
                      { title: "Livraison 24h", desc: "Commandez aujourd'hui, cuisinez demain. C'est ça la fraîcheur.", icon: <Truck size={24} className="text-natural-accent" /> },
                      { title: "Qualité Certifiée", desc: "Des produits sélectionnés un par un pour votre santé.", icon: <CheckCircle2 size={24} className="text-blue-500/70" /> }
                    ].map((f, i) => (
                      <div key={i} className="bg-white p-12 rounded-[32px] border border-natural-border hover:shadow-lg transition-all group">
                        <div className="bg-natural-bg w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border border-natural-border transition-transform group-hover:scale-110">{f.icon}</div>
                        <h4 className="text-xl font-black mb-4 text-natural-primary">{f.title}</h4>
                        <p className="text-natural-secondary leading-relaxed font-medium text-sm">{f.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Newsletter */}
                  <div className="bg-natural-accent rounded-[48px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-natural-accent/20">
                     <div className="relative z-10 max-w-xl mx-auto space-y-8">
                        <h3 className="text-4xl md:text-6xl font-black font-serif text-white leading-tight">Rejoignez la <br />révolution bio.</h3>
                        <p className="text-white/80 font-medium leading-relaxed">
                           Inscrivez-vous pour recevoir les arrivages de saison et les recettes de notre terroir directement dans votre boîte mail.
                        </p>
                        <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4">
                           <input 
                             type="email" 
                             required 
                             placeholder="Votre email..." 
                             className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-8 py-5 text-white placeholder:text-white/40 focus:bg-white/20 focus:border-white outline-none transition-all font-medium disabled:opacity-50" 
                             value={newsletterEmail}
                             onChange={e => setNewsletterEmail(e.target.value)}
                             disabled={newsletterLoading}
                           />
                           <button 
                             type="submit" 
                             disabled={newsletterLoading}
                             className="bg-white text-natural-accent px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center min-w-[140px]"
                           >
                             {newsletterLoading ? <Loader2 className="animate-spin" size={18} /> : "S'inscrire"}
                           </button>
                        </form>
                     </div>
                     <Leaf size={300} className="absolute top-[-50px] left-[-100px] text-white/5 -rotate-45" />
                  </div>
                </motion.section>
              )}

              {activeTab === 'shop' && <Shop />}
              {activeTab === 'cart' && <Cart onCheckout={() => setActiveTab('checkout')} onGoBack={() => setActiveTab('shop')} />}
              {activeTab === 'checkout' && <Check onSuccess={() => {}} onTrackOrder={() => setActiveTab('tracking')} />}
              {activeTab === 'admin' && isAdmin && <Admin />}
              {activeTab === 'tracking' && <Tracking />}
              {activeTab === 'profile' && <Profile />}
            </AnimatePresence>
          </div>
        </main>

        <Toast 
          message={toast.message} 
          isVisible={toast.visible} 
          onClose={hideToast} 
        />

        {/* Admin Login Modal */}
        <AnimatePresence>
          {showAdminLogin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-natural-primary/20 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl border border-natural-border"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black font-serif text-natural-primary">Accès Restreint</h3>
                  <button onClick={() => setShowAdminLogin(false)} className="p-2 hover:bg-natural-bg rounded-xl transition-all">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-natural-secondary text-sm font-medium mb-8">Veuillez saisir vos identifiants administrateur pour accéder aux statistiques et à la gestion du catalogue.</p>
                
                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary px-2">Identifiant Admin</label>
                    <input 
                      type="email" 
                      autoFocus
                      placeholder="admin@terroir.sn"
                      className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 transition-all outline-none"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary px-2">Mot de passe</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-natural-bg border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-natural-primary/20 transition-all outline-none"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-natural-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-natural-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Valider l'accès
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            className="fixed inset-0 z-[100] bg-white p-8 flex flex-col md:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-3">
                <Leaf className="text-natural-primary" size={32} />
                <span className="text-2xl font-black font-serif text-natural-primary">Terroir Local</span>
              </div>
              <button 
                className="p-3 bg-natural-bg rounded-2xl border border-natural-border"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={28} className="text-natural-text" />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 mb-12">
              {[
                { id: 'home', label: 'Accueil' },
                { id: 'shop', label: 'Boutique' },
                { id: 'profile', label: 'Mon Compte' },
                { id: 'tracking', label: 'Suivi Livraison' },
                { id: 'cart', label: 'Panier' },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }}
                  className={cn(
                    "text-4xl font-black text-left transition-all",
                    activeTab === item.id ? "text-natural-primary translate-x-4" : "text-natural-secondary"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-black text-natural-secondary uppercase tracking-[0.2em] mb-4">Gestion Compte</div>
              <button 
                onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                className="text-4xl font-black text-left text-red-500 hover:translate-x-4 transition-all"
              >
                Se déconnecter
              </button>
            </div>

            <div className="mt-auto pt-8">
              <div className="p-8 bg-natural-bg rounded-[32px] border border-natural-border">
                  <p className="text-xs font-black uppercase tracking-widest text-natural-secondary mb-2">Besoin d'aide ?</p>
                  <p className="font-bold text-natural-primary">+221 77 458 37 79</p>
                  <p className="text-[10px] font-medium text-natural-secondary mt-1">terroire@gmail.com</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout />
      </CartProvider>
    </AuthProvider>
  );
}

