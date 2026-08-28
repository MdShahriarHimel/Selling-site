/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, PromoCode } from '../types';
import IconRenderer from './IconRenderer';
import { PROMO_CODES } from '../data/products';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  appliedPromo: PromoCode | null;
  onApplyPromo: (promo: PromoCode | null) => void;
  onChangeQty: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
  onBrowseProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  appliedPromo,
  onApplyPromo,
  onChangeQty,
  onRemoveItem,
  onClearCart,
  onOpenCheckout,
  onBrowseProducts,
}) => {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const totalItemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.discountPercent) / 100 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (PROMO_CODES[cleanCode]) {
      onApplyPromo(PROMO_CODES[cleanCode]);
      setPromoSuccess(`Applied ${PROMO_CODES[cleanCode].discountPercent}% discount!`);
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon code. Try LUMINA10 or DIGI20');
    }
  };

  const handleRemovePromo = () => {
    onApplyPromo(null);
    setPromoSuccess('');
    setPromoError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-[#0a0b15] border-l border-white/10 flex flex-col justify-between shadow-2xl text-white relative z-10"
            >
              {/* Top Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00ffc4]/10 border border-[#00ffc4]/20 flex items-center justify-center text-[#00ffc4]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-white">Your Cart</h3>
                    <span className="text-xs font-mono text-[#00ffc4]">
                      {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} selected
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  data-cursor-text="CLOSE"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="font-heading font-bold text-base text-white">Your cart is empty</h4>
                    <p className="text-xs text-white/50 max-w-xs mt-1 mb-6">
                      Explore our digital subscription catalog and unlock premium tools at up to 95% off.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        onBrowseProducts();
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#00ffc4]/15 border border-[#00ffc4]/30 text-[#00ffc4] text-xs font-bold uppercase tracking-wider hover:bg-[#00ffc4]/25 transition-all"
                      data-cursor-text="BROWSE"
                    >
                      Browse Catalog
                    </button>
                  </div>
                ) : (
                  <>
                    {cart.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
                      >
                        {/* Image / Icon Thumbnail */}
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/15 overflow-hidden flex items-center justify-center text-[#00ffc4] shrink-0">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <IconRenderer name={item.product.iconName} className="w-5 h-5 stroke-[2]" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-heading font-bold text-sm text-white truncate">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-white/50 font-mono mt-0.5">
                            <span>{item.product.duration}</span>
                            <span>•</span>
                            <span className="text-[#00ffc4] font-semibold">${item.product.price.toFixed(2)} ea</span>
                          </div>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
                          <button
                            onClick={() => onChangeQty(item.product.id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white rounded hover:bg-white/10 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold font-mono px-1.5 min-w-[20px] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => onChangeQty(item.product.id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white rounded hover:bg-white/10 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-sm text-[#00ffc4]">
                            ${(item.product.price * item.qty).toFixed(2)}
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-white/40 hover:text-rose-400 p-1 mt-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}

                    {/* Promo Code Box */}
                    <div className="pt-2">
                      {appliedPromo ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#00ffc4]/10 border border-[#00ffc4]/30 text-xs">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#00ffc4]" />
                            <div>
                              <span className="font-mono font-bold text-[#00ffc4]">{appliedPromo.code}</span>
                              <span className="text-white/70 ml-2">({appliedPromo.discountPercent}% OFF)</span>
                            </div>
                          </div>
                          <button
                            onClick={handleRemovePromo}
                            className="text-xs text-white/50 hover:text-white underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyPromo} className="space-y-2">
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                              <input
                                type="text"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                placeholder="Coupon code (e.g. LUMINA10)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 font-mono uppercase focus:outline-none focus:border-[#00ffc4]/50"
                              />
                            </div>
                            <button
                              type="submit"
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-colors"
                            >
                              Apply
                            </button>
                          </div>
                          {promoError && <p className="text-[11px] text-rose-400 font-mono">{promoError}</p>}
                          {promoSuccess && <p className="text-[11px] text-[#00ffc4] font-mono">{promoSuccess}</p>}
                        </form>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-5 sm:p-6 border-t border-white/10 bg-[#0c0d18] space-y-4">
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-white/60">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {appliedPromo && (
                      <div className="flex justify-between text-[#00ffc4]">
                        <span>Promo Discount ({appliedPromo.discountPercent}%)</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/10 font-heading">
                      <span>Estimated Total</span>
                      <span className="text-[#00ffc4] font-black">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-white/50 bg-white/[0.02] p-2 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant automated license key delivery upon checkout</span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={onOpenCheckout}
                      className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(4,120,87,0.5)] active:scale-[0.98] transition-all"
                      data-cursor-text="PAY"
                    >
                      Proceed to Checkout (${finalTotal.toFixed(2)})
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={onClearCart}
                      className="w-full py-2 text-center text-xs text-rose-400/80 hover:text-rose-400 hover:underline transition-colors"
                    >
                      Clear All Items
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
