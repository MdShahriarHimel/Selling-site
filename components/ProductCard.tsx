/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import IconRenderer from './IconRenderer';
import { ShoppingCart, Check, Heart, Eye, Zap, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  inCart: boolean;
  cartQty: number;
  isWishlisted: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inCart,
  cartQty,
  isWishlisted,
  onAddToCart,
  onToggleWishlist,
  onOpenDetails,
}) => {
  const [imageError, setImageError] = useState(false);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const getBadgeConfig = (badge: Product['badge']) => {
    switch (badge) {
      case 'hot':
        return { label: '🔥 Hot Deal', bg: 'bg-rose-500/80 text-white border-rose-400' };
      case 'new':
        return { label: '✨ New Release', bg: 'bg-[#00ffc4]/90 text-slate-950 font-bold border-[#00ffc4]' };
      case 'popular':
        return { label: '⭐ Best Seller', bg: 'bg-amber-400/90 text-slate-950 font-bold border-amber-300' };
      case 'lifetime':
        return { label: '♾️ Lifetime', bg: 'bg-purple-600/90 text-white border-purple-400' };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig(product.badge);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d0e1b]/80 backdrop-blur-md p-4 sm:p-5 overflow-hidden transition-all duration-300 hover:border-[#00ffc4]/40 hover:bg-[#121324]/95 hover:shadow-[0_0_35px_rgba(0,255,196,0.14)]"
      data-cursor-text="VIEW"
    >
      {/* Shimmer on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      <div>
        {/* Standard Size Product Picture Container (16:9 Aspect Ratio) */}
        <div 
          onClick={() => onOpenDetails(product)}
          className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950/70 border border-white/10 mb-4 cursor-pointer group-hover:border-cyan-400/30 transition-colors shadow-inner"
        >
          {product.imageUrl && !imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-cyan-400/80 p-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-300 mb-2">
                <IconRenderer name={product.iconName} className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">{product.name}</span>
            </div>
          )}

          {/* Dark gradient overlay for bottom text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e1b]/80 via-transparent to-black/30 pointer-events-none" />

          {/* Floating Badges & Discount */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            {badgeConfig && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md shadow-sm ${badgeConfig.bg}`}>
                {badgeConfig.label}
              </span>
            )}
            {discountPercent && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-950 bg-[#00ffc4] px-2 py-0.5 rounded-md backdrop-blur-md shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Floating Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            aria-label="Save to Wishlist"
            className={`absolute top-2.5 right-2.5 p-2 rounded-xl border backdrop-blur-md transition-all duration-200 z-10 shadow-sm ${
              isWishlisted
                ? 'bg-rose-500/90 border-rose-400 text-white'
                : 'bg-black/50 border-white/20 text-white/70 hover:text-white hover:bg-black/70'
            }`}
            data-cursor-text="SAVE"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>

          {/* Bottom Pill: Category + Delivery */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-white/90 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
              {product.category}
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-emerald-300" />
              {product.deliveryType}
            </span>
          </div>
        </div>

        {/* Product Title & Duration */}
        <div className="relative z-10 cursor-pointer" onClick={() => onOpenDetails(product)}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading font-bold text-base sm:text-lg text-white group-hover:text-[#00ffc4] transition-colors leading-snug">
              {product.name}
            </h3>
            <span className="text-[11px] font-mono text-[#a8fbd3] font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5 whitespace-nowrap">
              {product.duration}
            </span>
          </div>

          <p className="text-xs text-white/65 mt-2 line-clamp-2 leading-relaxed font-light">
            {product.shortDesc}
          </p>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-4 pt-3.5 border-t border-white/10 relative z-10">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-black text-2xl text-white text-gradient">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-white/40 line-through font-mono">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-white/50">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{product.warranty || 'Warranty Included'}</span>
            </div>
          </div>

          <button
            onClick={() => onOpenDetails(product)}
            className="text-xs text-white/70 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium border border-white/5"
            data-cursor-text="SPECS"
          >
            <Eye className="w-3.5 h-3.5" />
            Specs
          </button>
        </div>

        {/* Buttons: Add to Cart */}
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => onAddToCart(product)}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              inCart
                ? 'bg-[#00ffc4]/20 text-[#00ffc4] border border-[#00ffc4]/50 shadow-[0_0_20px_rgba(0,255,196,0.2)]'
                : 'bg-gradient-to-r from-[#047857] to-[#059669] text-white hover:from-[#059669] hover:to-[#10b981] hover:shadow-[0_0_25px_rgba(4,120,87,0.5)] active:scale-[0.98]'
            }`}
            data-cursor-text="CART"
          >
            {inCart ? (
              <>
                <Check className="w-4 h-4 text-[#00ffc4]" />
                In Cart ({cartQty})
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
