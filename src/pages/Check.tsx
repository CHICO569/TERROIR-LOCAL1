/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CITIES_SENEGAL } from '../constants';
import { DeliveryInfo, ShippingMethod } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Building, Mail, User, CheckCircle2, Loader2, Download, ArrowRight, CreditCard, Truck, ShoppingBag, Store, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';
import emailjs from '@emailjs/browser';

import { orderService } from '../services/orderService';

interface CheckoutProps {
  onSuccess: (orderId: string) => void;
  onTrackOrder?: () => void;
}

export function Check({ onSuccess, onTrackOrder }: CheckoutProps) {
  const { items, total, clearCart, addToast } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DeliveryInfo>(() => {
    const saved = localStorage.getItem('terroir-checkout-form');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: 'Dakar',
      neighborhood: '',
      shippingMethod: 'standard',
      instructions: ''
    };
  });

  const SHIPPING_COSTS: Record<ShippingMethod, number> = {
    standard: 1500,
    express: 3500,
    pickup: 0
  };

  const shippingCost = SHIPPING_COSTS[formData.shippingMethod];
  const finalTotal = total + shippingCost;

  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'om' | 'transfer' | 'card'>('wave');
  const [paymentPhone, setPaymentPhone] = useState('');
  const [orderId, setOrderId] = useState(`TL-${Date.now().toString().slice(-5)}`);
  const [completedOrder, setCompletedOrder] = useState<{
    items: any[];
    total: number;
    shipping: number;
    finalTotal: number;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('terroir-checkout-form', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paydunya') === 'success') {
      setStep('payment');
      finalizeOrderAfterPayment();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('paydunya') === 'cancel') {
      setError("Le paiement a été annulé.");
      setStep('payment');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const finalizeOrderAfterPayment = async () => {
    setLoading(true);
    let currentId = orderId;
    try {
      try {
        const order = await orderService.createOrder(items, finalTotal, formData, selectedMethod, user?.id);
        if (order?.id) {
          currentId = `TL-${order.id.toString().substring(0, 8).toUpperCase()}`;
          setOrderId(currentId);
        }
      } catch (dbError) {
        console.warn('Supabase not fully configured, continuing in simulation mode.', dbError);
      }

      setEmailSending(true);
      const recipientEmail = formData.email?.trim() || "";
      if (recipientEmail) {
        const finalItems = [...items];
        setCompletedOrder({
          items: finalItems,
          total: total,
          shipping: shippingCost,
          finalTotal: finalTotal
        });

        try {
          await emailjs.send(
            'service_z8okin2',
            'template_l9qt6um',
            {
              to_email: recipientEmail,
              email: recipientEmail,
              order_id: currentId,
              orders: finalItems.map(item => ({
                name: item.name,
                units: item.quantity,
                price: (item.unitPrice || 0) * (item.quantity || 1)
              })),
              cost: { shipping: shippingCost, tax: 0, total: finalTotal }
            },
            'mNqgrWOCI2ShdsB7e'
          );
          addToast("Commande confirmée et e-mail envoyé !");
        } catch (mailError) {
          console.error("Email error:", mailError);
        } finally {
          setEmailSending(false);
        }
      }

      setLoading(false);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      clearCart();
      if (onSuccess) onSuccess(currentId);
    } catch (err: any) {
      setLoading(false);
      setError("Erreur finale: " + (err.message || "Inconnue"));
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await finalizeOrderAfterPayment();
    } catch (err: any) {
      console.error("Simulation Error:", err);
      setError("Le paiement a échoué. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const date = new Date().toLocaleDateString('fr-FR');

      // Utiliser completedOrder si disponible, sinon utiliser items (fallback)
      const context = completedOrder || {
        items: items,
        total: total,
        shipping: shippingCost,
        finalTotal: finalTotal
      };

      doc.setFontSize(22);
      doc.setTextColor(90, 90, 64); // #5a5a40
      doc.text('TERROIR LOCAL', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(138, 138, 117); // #8a8a75
      doc.text('Produits Authentiques du Terroir', 105, 28, { align: 'center' });

      doc.setDrawColor(224, 224, 213); // #e0e0d5
      doc.line(20, 35, 190, 35);

      doc.setFontSize(14);
      doc.setTextColor(45, 45, 42); // #2d2d2a
      doc.text(`REÇU N° ${orderId || 'COMMANDE'}`, 20, 50);
      doc.setFontSize(10);
      doc.text(`Date : ${date}`, 20, 58);
      const methodLabels = { wave: 'Wave', om: 'Orange Money', transfer: 'Virement', card: 'Carte Bancaire' };
      doc.text(`Moyen de paiement : ${methodLabels[selectedMethod] || selectedMethod}`, 20, 64);
      doc.text(`Livraison : ${(formData?.shippingMethod || 'Standard').toUpperCase()}`, 20, 70);

      doc.text('CLIENT :', 20, 85);
      doc.text(formData?.fullName || 'Client', 20, 91);
      doc.text(formData?.email || 'Email non fourni', 20, 97);
      doc.text(formData?.phone || 'Téléphone non fourni', 20, 103);

      doc.text('ADRESSE DE LIVRAISON :', 110, 85);
      const addressText = formData?.address || "Adresse de livraison";
      const splitAddress = doc.splitTextToSize(addressText, 80);
      doc.text(splitAddress, 110, 91);

      const neighborhoodCity = `${formData?.neighborhood || ""}${formData?.neighborhood && formData?.city ? ', ' : ''}${formData?.city || ""}`;
      const addressOffset = Array.isArray(splitAddress) ? splitAddress.length * 5 : 5;
      doc.text(neighborhoodCity, 110, 91 + addressOffset);

      if (formData?.instructions) {
        doc.text('INSTRUCTIONS :', 20, 115);
        doc.setFont('helvetica', 'italic');
        const splitInstructions = doc.splitTextToSize(formData.instructions, 170);
        doc.text(splitInstructions, 20, 121);
        doc.setFont('helvetica', 'normal');
      }

      let y = formData?.instructions ? 140 : 125;
      doc.line(20, y - 5, 190, y - 5);
      doc.text('ARTICLES', 20, y);
      y += 10;

      if (context.items && context.items.length > 0) {
        context.items.forEach(item => {
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          const itemName = item.name || "Produit";
          const itemQty = item.quantity || 1;
          const itemPrice = (item.unitPrice || 0) * (item.quantity || 1);

          doc.text(`${itemName} x${itemQty}`, 20, y);
          doc.text(formatPrice(itemPrice).replace('\u00a0', ' '), 190, y, { align: 'right' });
          y += 8;
        });
      } else {
        doc.text('Aucun article trouvé.', 20, y);
        y += 8;
      }

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.line(20, y, 190, y);
      y += 10;
      doc.text('Frais de livraison', 20, y);
      doc.text(formatPrice(context.shipping || 0).replace('\u00a0', ' '), 190, y, { align: 'right' });
      y += 10;

      doc.line(20, y, 190, y);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL À PAYER : ${formatPrice(context.finalTotal || 0).replace('\u00a0', ' ')}`, 190, y + 15, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      doc.setFontSize(10);
      doc.setTextColor(90, 90, 64);
      doc.text('Merci pour votre commande sur Terroir Local !', 105, 285, { align: 'center' });

      doc.save(`Recu_Terroir_Local_${orderId || 'Commande'}.pdf`);
    } catch (pdfError) {
      console.error("Erreur génération PDF:", pdfError);
      addToast("Erreur lors de la génération du PDF.");
    }
  };

  // Source of truth values for the final summary (using completedOrder OR current state)
  const displayFinalTotal = completedOrder?.finalTotal ?? finalTotal;
  const displayShipping = completedOrder?.shipping ?? shippingCost;
  const displayOrderId = orderId || 'TL-00000';
  const displayEmail = formData?.email || 'votre email';
  const displayFirstName = (formData?.fullName || 'Client').split(' ')[0];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Progress Stepper */}
      <div className="flex items-center justify-center mb-16 gap-6">
        {[
          { id: 'details', label: 'Livraison' },
          { id: 'payment', label: 'Paiement' },
          { id: 'success', label: 'Confirmation' }
        ].map((s, i) => (
          <div key={s.id} className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all border-2",
              step === s.id ? "bg-natural-primary text-white border-natural-primary shadow-xl shadow-natural-primary/20 scale-110" : "bg-white text-natural-secondary border-natural-border"
            )}>
              {i + 1}
            </div>
            <span className={cn("text-[10px] uppercase font-black tracking-widest hidden sm:block", step === s.id ? "text-natural-primary" : "text-natural-secondary")}>
              {s.label}
            </span>
            {i < 2 && <div className="w-12 h-[2px] bg-natural-border mx-2 hidden sm:block rounded-full" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-natural-border p-12 rounded-[48px] shadow-2xl shadow-natural-primary/5"
              >
                <h2 className="text-3xl font-black font-serif mb-10 flex items-center gap-4 text-natural-primary">
                  <MapPin className="text-natural-accent" size={32} />
                  Détails de Livraison
                </h2>

                <form onSubmit={handleSubmitDetails} className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Nom du destinataire</label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-border" size={18} />
                      <input required type="text" placeholder="Ex: Makhtar Diop"
                        className="w-full bg-natural-bg border border-natural-border pl-14 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all"
                        value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-border" size={18} />
                      <input required type="email" placeholder="votre@email.com"
                        className="w-full bg-natural-bg border border-natural-border pl-14 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all"
                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Téléphone Sénégal</label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-border" size={18} />
                      <input required type="tel" placeholder="+221 7X XXX XX XX"
                        className="w-full bg-natural-bg border border-natural-border pl-14 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all"
                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Ville</label>
                    <div className="relative">
                      <Building className="absolute left-5 top-1/2 -translate-y-1/2 text-natural-border" size={18} />
                      <select className="w-full bg-natural-bg border border-natural-border pl-14 pr-10 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all appearance-none"
                        value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}>
                        {CITIES_SENEGAL.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Adresse précise & Quartier</label>
                    <input required type="text" placeholder="Ex: Mbour 1, Villa 124..."
                      className="w-full bg-natural-bg border border-natural-border px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all"
                      value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>

                  {/* Shipping Methods */}
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Mode de Livraison</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'standard', name: 'Standard', price: 1500, time: '2-3 jours', icon: <Truck size={20} /> },
                        { id: 'express', name: 'Express', price: 3500, time: '24h', icon: <Clock size={20} /> },
                        { id: 'pickup', name: 'Point Relais', price: 0, time: 'Sur place', icon: <Store size={20} /> }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, shippingMethod: m.id as ShippingMethod })}
                          className={cn(
                            "p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3",
                            formData.shippingMethod === m.id ? "bg-natural-bg border-natural-primary shadow-lg ring-4 ring-natural-primary/5" : "bg-white border-natural-border hover:border-natural-accent/50"
                          )}
                        >
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", formData.shippingMethod === m.id ? "bg-natural-primary text-white" : "bg-natural-bg text-natural-secondary")}>
                            {m.icon}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-natural-primary">{m.name}</p>
                            <p className="text-lg font-black text-natural-primary">{m.price === 0 ? 'Gratuit' : formatPrice(m.price)}</p>
                            <p className="text-[9px] font-bold text-natural-secondary">{m.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary ml-1">Instructions spéciales (Optionnel)</label>
                    <textarea
                      placeholder="Ex: Interphone en panne, appeler à l'arrivée..."
                      className="w-full bg-natural-bg border border-natural-border px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-natural-primary/5 font-medium transition-all h-32 resize-none"
                      value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} />
                  </div>

                  <button type="submit" className="md:col-span-2 bg-natural-primary text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:opacity-95 transition-all flex items-center justify-center gap-4 mt-4 shadow-xl shadow-natural-primary/20">
                    Continuer vers le paiement ({formatPrice(finalTotal)})
                    <ArrowRight size={18} />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-natural-border p-12 rounded-[48px] shadow-2xl shadow-natural-accent/10"
              >
                <h2 className="text-3xl font-black font-serif mb-8 text-natural-primary text-center">Mode de Paiement</h2>

                {/* Method Selection */}
                <div className="grid grid-cols-4 gap-4 mb-10">
                  {[
                    { id: 'wave', logo: 'https://th.bing.com/th/id/OIP.x2uneEc-42AfQqb_5n3zfAHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3', name: 'Wave' },
                    { id: 'om', logo: 'https://tse2.mm.bing.net/th/id/OIP.JBfKMKphkVCniYeZLRJcAgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3', name: 'Orange' },
                    { id: 'transfer', logo: 'https://tse3.mm.bing.net/th/id/OIP.1HJRlvhZMjr7vEbzb3OiOwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3', name: 'Banque' },
                    { id: 'card', name: 'Carte', icon: <CreditCard size={24} /> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id as any)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                        selectedMethod === m.id ? "bg-natural-bg border-natural-accent scale-105 shadow-lg" : "bg-white border-natural-border hover:border-natural-accent/50"
                      )}
                    >
                      {m.logo ? (
                        <img src={m.logo} alt={m.name} className="w-10 h-10 object-contain rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center text-natural-primary">{m.icon}</div>
                      )}
                      <span className="text-[8px] font-black uppercase tracking-widest">{m.name}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-8 max-w-sm mx-auto">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                      {error}
                    </div>
                  )}
                  {selectedMethod !== 'card' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary text-center block">Numéro de téléphone {selectedMethod.toUpperCase()}</label>
                      <input
                        autoFocus
                        type="tel"
                        placeholder="7X XXX XX XX"
                        className={cn(
                          "w-full bg-natural-bg border-2 border-natural-border px-6 py-6 rounded-3xl text-center text-3xl font-black tracking-[0.2em] outline-none transition-all shadow-inner",
                          selectedMethod === 'wave' ? 'text-blue-600 focus:border-blue-400' :
                            selectedMethod === 'om' ? 'text-orange-600 focus:border-orange-400' : 'text-red-600 focus:border-red-400'
                        )}
                        value={paymentPhone}
                        onChange={e => setPaymentPhone(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 bg-natural-bg border border-natural-border rounded-3xl text-natural-primary text-xs font-bold flex flex-col items-center gap-2">
                        <CreditCard size={32} className="opacity-40" aria-hidden="true" />
                        Paiement par carte bientôt disponible.
                        <p className="text-[9px] opacity-60">Veuillez privilégier le Mobile Money pour le moment.</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSimulatePayment}
                    disabled={loading || (selectedMethod !== 'card' && paymentPhone.length < 9) || selectedMethod === 'card'}
                    className="w-full bg-natural-accent text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 disabled:opacity-50 transition-all shadow-2xl shadow-natural-accent/20 active:scale-95"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {emailSending ? "Envoi de l'e-mail..." : "Transaction en cours..."}
                      </>
                    ) : (
                      <>
                        Payer {formatPrice(finalTotal)}
                        <CheckCircle2 size={18} />
                      </>
                    )}
                  </button>
                  <p className="text-[9px] font-black text-natural-secondary uppercase tracking-[0.1em] text-center">Garantie sécurisée par la coopérative</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-natural-border p-16 rounded-[60px] text-center shadow-[0_40px_80px_-20px_rgba(90,90,64,0.15)] relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
                    <CheckCircle2 size={56} />
                  </div>
                  <h2 className="text-5xl font-black text-natural-primary font-serif mb-4 leading-tight">Merci, {displayFirstName} !</h2>
                  <p className="text-xl text-natural-secondary mb-2 font-medium">Votre commande <span className="font-black text-natural-accent">#{displayOrderId}</span> est validée.</p>
                  <p className="text-xs text-natural-secondary mb-12 font-bold bg-natural-primary/5 inline-block px-4 py-2 rounded-full border border-natural-primary/10">
                    📧 Un e-mail de confirmation a été envoyé automatiquement à <span className="text-natural-primary underline">{displayEmail}</span>
                  </p>

                  <div className="bg-natural-bg p-10 rounded-[40px] mb-12 border border-natural-border flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-left space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-natural-secondary">Total versé au terroir</p>
                      <p className="text-4xl font-black text-natural-primary tracking-tighter">
                        {formatPrice(displayFinalTotal)}
                      </p>
                      <p className="text-[9px] font-bold text-natural-secondary">
                        Dont {formatPrice(displayShipping)} de livraison
                      </p>
                    </div>
                    <div className="flex flex-col gap-4 w-full md:w-auto">
                      <p className="text-center md:text-left text-[9px] font-black uppercase tracking-widest text-natural-accent">Votre document est prêt :</p>
                      <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4 w-full">
                        <button
                          onClick={generatePDF}
                          className="w-full sm:w-auto bg-natural-primary text-white border-2 border-natural-primary px-8 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-natural-primary/90 transition-all shadow-2xl shadow-natural-primary/30 transform hover:scale-105"
                        >
                          <Download size={24} />
                          TÉLÉCHARGER LE REÇU (PDF)
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="w-full sm:w-auto bg-white border-2 border-natural-border text-natural-primary px-8 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-natural-bg transition-all shadow-md transform hover:scale-105"
                        >
                          <ShoppingBag size={24} />
                          IMPRIMER
                        </button>
                        <button
                          onClick={onTrackOrder}
                          className="w-full sm:w-auto bg-natural-accent text-white px-8 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-2xl shadow-natural-accent/30 transform hover:scale-105"
                        >
                          <Truck size={24} />
                          SUIVRE MON COLIS
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-natural-secondary flex flex-col items-center gap-6">
                    <div className="p-4 bg-white rounded-2xl border border-dashed border-natural-primary/30 max-w-xs text-center">
                      {formData?.shippingMethod === 'pickup' ? (
                        <>📍 Votre colis vous attend au <span className="text-natural-primary underline decoration-2">Point de Retrait Local</span>.</>
                      ) : (
                        <>🏠 Livraison prévue à <span className="text-natural-primary underline decoration-2">{formData?.neighborhood || "votre quartier"}</span> {formData?.shippingMethod === 'express' ? 'dans 24h' : 'sous 3 jours'}.</>
                      )}
                    </div>
                    <button onClick={() => window.location.reload()} className="text-sm font-black uppercase tracking-[0.2em] text-white bg-natural-primary px-8 py-4 rounded-xl shadow-lg hover:bg-natural-primary/90 transition-all mt-4">
                      RETOUR À L'ACCUEIL
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Order Summary */}
        {step !== 'success' && (
          <aside className="space-y-8 sticky top-8">
            <div className="bg-white border border-natural-border p-8 rounded-[40px] shadow-xl shadow-natural-primary/5">
              <h3 className="text-xl font-black font-serif text-natural-primary mb-8 flex items-center gap-3">
                <ShoppingBag className="text-natural-accent" size={24} />
                Votre Commande
              </h3>

              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-natural-bg rounded-2xl flex items-center justify-center text-natural-secondary font-black border border-natural-border/50">
                      x{item.quantity}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-natural-primary truncate">{item.name}</p>
                      <p className="text-[10px] font-bold text-natural-secondary">{formatPrice(item.unitPrice)} / kg</p>
                    </div>
                    <p className="text-xs font-black text-natural-primary">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-8 border-t border-natural-border">
                <div className="flex justify-between text-xs font-bold text-natural-secondary">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-natural-secondary">
                  <span>Livraison ({formData.shippingMethod})</span>
                  <span>{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-natural-primary">Total à payer</span>
                  <span className="text-3xl font-black text-natural-primary tracking-tighter">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <div className="bg-natural-accent/5 border border-natural-accent/10 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-2 text-natural-accent">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Achat Responsable</span>
              </div>
              <p className="text-[10px] text-natural-secondary font-medium leading-relaxed">
                En commandant sur Terroir Local, vous soutenez directement plus de 50 agriculteurs locaux.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
