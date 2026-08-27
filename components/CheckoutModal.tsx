/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, OrderReceipt, OrderItem, PromoCode } from '../types';
import { saveOrderToDb } from '../services/firebaseDb';
import {
  X,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  QrCode,
  DollarSign,
  Lock,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedPromo: PromoCode | null;
  onOrderCompleted: (receipt: OrderReceipt) => void;
}

type PaymentMethodType = 'card' | 'crypto' | 'paypal' | 'discord';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  appliedPromo,
  onOrderCompleted,
}) => {
  const [email, setEmail] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cryptoCoin, setCryptoCoin] = useState<'USDT' | 'BTC' | 'ETH'>('USDT');

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<OrderReceipt | null>(null);
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const total = Math.max(0, subtotal - discount);

  const generateLicenseKey = (prefix: string, id: number) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({ length: 4 }).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const tag = prefix.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'VAULT';
    return `${tag}-${id}${segment()}-${segment()}-${segment()}`;
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsProcessing(true);

    setTimeout(() => {
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        duration: item.product.duration,
        price: item.product.price,
        qty: item.qty,
        licenseKey: generateLicenseKey(item.product.name, item.product.id),
      }));

      const receipt: OrderReceipt = {
        orderId: `DV-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toLocaleString(),
        customerEmail: email,
        items: orderItems,
        subtotal,
        discount,
        total,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'Completed',
      };

      setOrderReceipt(receipt);
      onOrderCompleted(receipt);
      // Save directly to Firestore collection
      saveOrderToDb(receipt).catch((err) => console.warn('Cloud sync error for order:', err));
      setIsProcessing(false);
    }, 1800);
  };

  const handleCopyKey = (key: string, idx: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyIndex(idx);
    setTimeout(() => setCopiedKeyIndex(null), 2000);
  };

  const handleCopyAll = () => {
    if (!orderReceipt) return;
    const allText = orderReceipt.items
      .map((item) => `${item.name} (${item.duration}): ${item.licenseKey}`)
      .join('\n');
    navigator.clipboard.writeText(`Order ${orderReceipt.orderId}\n` + allText);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  const handleDownloadInvoice = () => {
    if (!orderReceipt) return;
    const textContent = `========================================
DIGIVAULT — ORDER RECEIPT & ACTIVATION KEYS
========================================
Order ID: ${orderReceipt.orderId}
Date: ${orderReceipt.createdAt}
Email: ${orderReceipt.customerEmail}
Payment: ${orderReceipt.paymentMethod}
Total Paid: $${orderReceipt.total.toFixed(2)}
Status: ${orderReceipt.status}

PRODUCTS & ACTIVATION LICENSES:
${orderReceipt.items
  .map(
    (item, i) =>
      `[${i + 1}] ${item.name} (${item.duration}) x${item.qty}
  License Key / Invite Token: ${item.licenseKey}
  Instructions: Paste token in account login or panel invite portal.
`
  )
  .join('\n')}

WARRANTY & SUPPORT:
- 24/7 Discord Support: https://discord.gg/digivault
- Instant replacement guarantee valid throughout your subscription duration.
========================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DigiVault-Receipt-${orderReceipt.orderId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={orderReceipt ? onClose : undefined}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#0c0d1b] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-auto z-10 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderReceipt ? (
          /* Checkout Form */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#00ffc4]/15 border border-[#00ffc4]/30 flex items-center justify-center text-[#00ffc4]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl text-white">Instant Secure Checkout</h3>
                <p className="text-xs text-white/50">Encrypted transmission • Automated instant key delivery</p>
              </div>
            </div>

            {/* Order Brief */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
              <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                <span>Items in Order ({cart.length})</span>
                <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
              </div>
              {appliedPromo && (
                <div className="flex items-center justify-between text-xs text-[#00ffc4] mb-2 font-mono">
                  <span>Coupon ({appliedPromo.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-base font-bold text-white pt-2 border-t border-white/10">
                <span className="font-heading">Total Amount Due</span>
                <span className="text-[#00ffc4] font-black text-xl font-heading">${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCompleteOrder} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Delivery Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00ffc4]/50 transition-colors"
                />
              </div>

              {/* Discord (Optional) */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-1.5">
                  Discord Username <span className="text-white/40">(Optional for 24/7 VIP Role)</span>
                </label>
                <input
                  type="text"
                  value={discordTag}
                  onChange={(e) => setDiscordTag(e.target.value)}
                  placeholder="e.g. username#1234 or @username"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00ffc4]/50 transition-colors"
                />
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'card', label: 'Card', icon: CreditCard },
                    { id: 'crypto', label: 'Crypto', icon: QrCode },
                    { id: 'paypal', label: 'PayPal', icon: DollarSign },
                    { id: 'discord', label: 'Discord', icon: Sparkles },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethodType)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-xs font-medium transition-all ${
                        paymentMethod === m.id
                          ? 'bg-[#00ffc4]/15 border-[#00ffc4]/50 text-[#00ffc4] shadow-[0_0_15px_rgba(0,255,196,0.15)]'
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment details container */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Card Number (4242 •••• •••• 4242)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00ffc4]/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00ffc4]/40"
                    />
                    <input
                      type="text"
                      required
                      placeholder="CVC / CVV"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00ffc4]/40"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'crypto' && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex gap-2">
                    {(['USDT', 'BTC', 'ETH'] as const).map((coin) => (
                      <button
                        key={coin}
                        type="button"
                        onClick={() => setCryptoCoin(coin)}
                        className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg border ${
                          cryptoCoin === coin
                            ? 'bg-[#00ffc4]/20 border-[#00ffc4]/50 text-[#00ffc4]'
                            : 'bg-white/5 border-white/10 text-white/50'
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>
                  <div className="p-2.5 rounded bg-black/50 border border-white/10 font-mono text-[11px] text-white/70 break-all">
                    Address: {cryptoCoin === 'USDT' ? 'TX9vLuminaVaultTrc20Deposit9988' : cryptoCoin === 'BTC' ? 'bc1q9lumina8832vaultdigi44' : '0x889LuminaVaultEthDeposit22'}
                  </div>
                  <p className="text-[10px] text-emerald-400">⚡ Automated blockchain scanner verifies deposit in ~30 seconds.</p>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-blue-200">
                  You will complete standard instant one-click PayPal authorization and receive keys immediately.
                </div>
              )}

              {paymentMethod === 'discord' && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200">
                  A private Discord support ticket will be linked with your email for manual local payment methods or questions.
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(4,120,87,0.5)] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating License Keys...
                  </>
                ) : (
                  <>
                    Pay ${total.toFixed(2)} & Get Instant Keys
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Order Confirmation & Keys Receipt */
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[#00ffc4] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-white">Payment Successful!</h3>
              <p className="text-xs text-white/60 mt-1">
                Order <span className="font-mono font-bold text-[#00ffc4]">{orderReceipt.orderId}</span> sent to{' '}
                <span className="text-white">{orderReceipt.customerEmail}</span>
              </p>
            </div>

            {/* Keys Display Box */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {orderReceipt.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00ffc4]/30 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-heading font-bold text-white">{item.name}</span>
                    <span className="text-[11px] font-mono text-[#a8fbd3] bg-white/5 px-2 py-0.5 rounded">
                      {item.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 font-mono text-xs text-[#00ffc4] tracking-wider select-all overflow-x-auto whitespace-nowrap">
                      {item.licenseKey}
                    </div>
                    <button
                      onClick={() => handleCopyKey(item.licenseKey, idx)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-[#00ffc4]/15 hover:border-[#00ffc4]/30 hover:text-[#00ffc4] text-white/60 transition-colors shrink-0"
                      title="Copy Key"
                    >
                      {copiedKeyIndex === idx ? (
                        <Check className="w-4 h-4 text-[#00ffc4]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={handleCopyAll}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                {allCopied ? <Check className="w-4 h-4 text-[#00ffc4]" /> : <Copy className="w-4 h-4" />}
                {allCopied ? 'All Keys Copied!' : 'Copy All Keys'}
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="flex-1 py-3 px-4 rounded-xl bg-[#00ffc4]/15 border border-[#00ffc4]/30 hover:bg-[#00ffc4]/25 text-[#00ffc4] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Receipt (.txt)
              </button>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs text-white/70 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Full warranty active. Keep this receipt or look up your email anytime in our portal.</span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Close & Continue Shopping
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
