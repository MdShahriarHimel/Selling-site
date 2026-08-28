/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import IconRenderer from './IconRenderer';
import {
  X,
  Check,
  ShieldCheck,
  Zap,
  Star,
  ShoppingCart,
  ArrowRight,
  Clock,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  inCart: boolean;
  cartQty: number;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  inCart,
  cartQty,
}) => {
  if (!product) return null;

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#0d0e1c] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden z-10 my-auto text-white"
        >
          {/* Glowing background accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00ffc4]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            data-cursor-text="CLOSE"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-5 pr-8">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00ffc4] shrink-0 shadow-[0_0_25px_rgba(0,255,196,0.2)]">
              <IconRenderer name={product.iconName} className="w-7 h-7 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#00ffc4] bg-[#00ffc4]/10 px-2.5 py-0.5 rounded-full border border-[#00ffc4]/20">
                  {product.category}
                </span>
                <span className="text-xs font-mono text-white/50 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                  {product.duration}
                </span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mt-1">
                {product.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-white/60">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 mr-1" />
                  <span className="font-bold text-white">{product.rating}</span>
                  <span className="text-white/40 ml-1">({product.reviewsCount} verified orders)</span>
                </div>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                  {product.deliveryType}
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Standard Product Picture Banner */}
          {product.imageUrl && (
            <div className="relative w-full aspect-[21/9] sm:aspect-[2.4/1] rounded-2xl overflow-hidden bg-black/50 border border-white/15 mb-5 shadow-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e1c] via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                <span className="text-xs font-semibold text-white/90 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                  Official License & Verified Access
                </span>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/30">
                  {product.warranty}
                </span>
              </div>
            </div>
          )}

          {/* Price Banner */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between mb-6">
            <div>
              <div className="text-xs text-white/50 uppercase tracking-wider font-mono">Special Direct Price</div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="font-heading font-black text-3xl text-[#00ffc4]">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-white/40 line-through font-mono">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-white/60 block">In Stock: {product.stockCount} Available</span>
              <span className="text-[11px] text-[#00ffc4] flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-3 h-3" /> Delivery in &lt; 2 min
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/50 mb-2">Overview</h4>
            <p className="text-sm text-white/80 leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* Features List */}
          <div className="mb-6">
            <h4 className="text-xs font-mono uppercase tracking-widest text-white/50 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00ffc4]" /> Included Features & Privileges
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-white/90 bg-white/[0.02] border border-white/5 p-2.5 rounded-xl"
                >
                  <Check className="w-4 h-4 text-[#00ffc4] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Guarantee Box */}
          <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-500/20 flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-[#00ffc4] shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-white">{product.warranty}</div>
              <div className="text-white/60">If anything goes wrong, receive a direct instant replacement via our automated portal.</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onAddToCart(product)}
              className={`flex-1 py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                inCart
                  ? 'bg-[#00ffc4]/15 border-[#00ffc4]/50 text-[#00ffc4]'
                  : 'bg-white/5 border-white/15 text-white hover:bg-white/10 hover:border-white/30'
              }`}
              data-cursor-text="ADD"
            >
              <ShoppingCart className="w-4 h-4" />
              {inCart ? `In Cart (${cartQty})` : 'Add to Cart'}
            </button>

            <button
              onClick={() => onBuyNow(product)}
              className="flex-1 py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white shadow-[0_0_30px_rgba(4,120,87,0.5)] active:scale-[0.98] transition-all"
              data-cursor-text="BUY"
            >
              Instant Buy Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
