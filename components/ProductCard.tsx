/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import IconRenderer from './IconRenderer';
import { ShoppingCart, Check, Heart, Eye, Zap, ShieldCheck } from 'lucide-react';

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
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const getBadgeConfig = (badge: Product['badge']) => {
    switch (badge) {
      case 'hot':
        return { label: '🔥 Hot Deal', bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'new':
        return { label: '✨ New Release', bg: 'bg-[#00ffc4]/15 text-[#00ffc4] border-[#00ffc4]/30' };
      case 'popular':
        return { label: '⭐ Best Seller', bg: 'bg-amber-400/15 text-amber-300 border-amber-400/30' };
      case 'lifetime':
        return { label: '♾️ Lifetime', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
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
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d0e1b]/70 backdrop-blur-md p-5 sm:p-6 overflow-hidden transition-all duration-300 hover:border-[#00ffc4]/40 hover:bg-[#121324]/90 hover:shadow-[0_0_35px_rgba(0,255,196,0.12)]"
      data-cursor-text="VIEW"
    >
      {/* Shimmer on Hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full duration-1000 transition-transform bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Top Bar: Icon + Badges + Wishlist */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#00ffc4] shadow-[0_0_20px_rgba(0,255,196,0.15)] group-hover:scale-105 group-hover:border-[#00ffc4]/40 transition-transform">
              <IconRenderer name={product.iconName} className="w-6 h-6 stroke-[2]" />
            </div>
            {badgeConfig && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeConfig.bg}`}>
                {badgeConfig.label}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            aria-label="Save to Wishlist"
            className={`p-2 rounded-xl border transition-all duration-200 ${
              isWishlisted
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
            }`}
            data-cursor-text="SAVE"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
          </button>
        </div>

        {/* Product Title & Duration */}
        <div className="relative z-10 cursor-pointer" onClick={() => onOpenDetails(product)}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#00ffc4] transition-colors leading-tight">
              {product.name}
            </h3>
            {discountPercent && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00ffc4] bg-[#00ffc4]/10 px-2 py-0.5 rounded-md border border-[#00ffc4]/20 whitespace-nowrap">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-white/60 font-mono">
            <span className="text-[#a8fbd3] font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {product.duration}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="w-3 h-3 fill-emerald-400" />
              {product.deliveryType}
            </span>
          </div>

          <p className="text-xs text-white/65 mt-3 line-clamp-2 leading-relaxed font-light">
            {product.shortDesc}
          </p>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
        <div className="flex items-baseline justify-between mb-3.5">
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
              <span>Warranty Included</span>
            </div>
          </div>

          <button
            onClick={() => onOpenDetails(product)}
            className="text-xs text-white/60 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors font-medium"
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
