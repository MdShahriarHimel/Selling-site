/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Heart,
  Zap,
  ShieldCheck,
  Headphones,
  BadgePercent,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Package,
  Star,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Menu,
  X,
  SlidersHorizontal,
  Plus,
  Flame,
  Clock,
  Layers,
  Lock,
} from 'lucide-react';

import FluidBackground from './components/FluidBackground';
import GradientText from './components/GlitchText';
import CustomCursor from './components/CustomCursor';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderLookupModal from './components/OrderLookupModal';
import AIChat from './components/AIChat';
import IconRenderer from './components/IconRenderer';
import AdminPanelModal from './components/AdminPanelModal';

import { PRODUCTS as DEFAULT_PRODUCTS, CATEGORIES, TESTIMONIALS, FAQS } from './data/products';
import { Product, ProductCategory, CartItem, OrderReceipt, PromoCode } from './types';
import {
  subscribeToProducts,
  subscribeToOrders,
  seedInitialDataIfEmpty
} from './services/firebaseDb';

export const App: React.FC = () => {
  // Live Cloud Database Products State
  const [productsList, setProductsList] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('digivault_cached_products');
      return cached ? JSON.parse(cached) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  // Live Cloud Orders
  const [cloudOrders, setCloudOrders] = useState<OrderReceipt[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Initial DB Seeding and Realtime Subscriptions
  useEffect(() => {
    seedInitialDataIfEmpty();

    const unsubProducts = subscribeToProducts((cloudProds) => {
      if (cloudProds && cloudProds.length > 0) {
        setProductsList(cloudProds);
        localStorage.setItem('digivault_cached_products', JSON.stringify(cloudProds));
      }
    });

    const unsubOrders = subscribeToOrders((orders) => {
      setCloudOrders(orders);
    });

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  // Persistence states
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('digivault_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('digivault_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedOrders, setSavedOrders] = useState<OrderReceipt[]>(() => {
    try {
      const saved = localStorage.getItem('digivault_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI States
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);

  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Secret shortcut & URL parameter trigger for Admin Panel
  useEffect(() => {
    // Check URL parameter: ?admin=true or ?vault=true or #admin
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || urlParams.get('vault') === 'true' || window.location.hash === '#admin') {
      setIsAdminOpen(true);
    }

    // Keyboard shortcut: Press Ctrl+Shift+A (or Cmd+Shift+A) to open Admin Panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem('digivault_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('digivault_orders', JSON.stringify(savedOrders));
  }, [savedOrders]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    showToast(`Added ${product.name} to cart ($${product.price.toFixed(2)})`);
  };

  const handleChangeQty = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Cart cleared');
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed ${product.name} from saved items`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved ${product.name} to wishlist`);
        return [...prev, product.id];
      }
    });
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    setActiveProductModal(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (receipt: OrderReceipt) => {
    setSavedOrders((prev) => [receipt, ...prev]);
    setCart([]);
    setAppliedPromo(null);
    showToast(`Order ${receipt.orderId} completed successfully!`);
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    let list = [...productsList];

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.duration.toLowerCase().includes(q) ||
          p.shortDesc.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (showOnlyWishlist) {
      list = list.filter((p) => wishlist.includes(p.id));
    }

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
        break;
      case 'featured':
      default:
        // Featured keeps priority badge order
        list.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
        break;
    }

    return list;
  }, [productsList, selectedCategory, searchQuery, sortBy, showOnlyWishlist, wishlist]);

  const totalCartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 85;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Quick bundle add
  const handleAddBundle = (bundleName: string, productIds: number[]) => {
    const bundleProducts = productsList.filter((p) => productIds.includes(p.id));
    setCart((prev) => {
      let updated = [...prev];
      bundleProducts.forEach((p) => {
        const existing = updated.find((i) => i.product.id === p.id);
        if (existing) {
          updated = updated.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
        } else {
          updated.push({ product: p, qty: 1 });
        }
      });
      return updated;
    });
    showToast(`Added ${bundleName} (${bundleProducts.length} items) to your cart!`);
    setIsCartOpen(true);
  };

  return (
    <div className="relative min-h-screen text-white selection:bg-[#00ffc4] selection:text-black cursor-auto md:cursor-none overflow-x-hidden font-sans">
      <CustomCursor />
      <FluidBackground />

      {/* STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#07080f]/80 backdrop-blur-xl border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group cursor-pointer"
            data-cursor-text="HOME"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#047857] via-[#00ffc4] to-[#00d2ff] p-[1.5px] shadow-[0_0_20px_rgba(0,255,196,0.3)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07080f] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#00ffc4] fill-[#00ffc4]/20" />
              </div>
            </div>
            <div>
              <div className="font-heading font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                DIGIVAULT
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#00ffc4]/15 text-[#00ffc4] border border-[#00ffc4]/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/50 tracking-wider hidden sm:block">
                PREMIUM DIGITAL LICENSES
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-wider uppercase text-white/70">
            <button
              onClick={() => scrollToSection('products')}
              className="hover:text-[#00ffc4] transition-colors bg-transparent border-none cursor-pointer"
            >
              Products Catalog
            </button>
            <button
              onClick={() => scrollToSection('bundles')}
              className="hover:text-[#00ffc4] transition-colors bg-transparent border-none cursor-pointer"
            >
              Curated Bundles
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#00ffc4] transition-colors bg-transparent border-none cursor-pointer"
            >
              Why Us
            </button>
            <button
              onClick={() => scrollToSection('reviews')}
              className="hover:text-[#00ffc4] transition-colors bg-transparent border-none cursor-pointer"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#00ffc4] transition-colors bg-transparent border-none cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          {/* Action Icons: Search, Orders, Wishlist, Cart, Discord */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* My Keys / Order Lookup Button */}
            <button
              onClick={() => setIsOrderLookupOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-semibold text-white/80 transition-colors"
              title="Lookup My License Keys"
              data-cursor-text="KEYS"
            >
              <Package className="w-4 h-4 text-[#00ffc4]" />
              <span className="hidden sm:inline">My Keys</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                setShowOnlyWishlist(!showOnlyWishlist);
                scrollToSection('products');
              }}
              className={`relative p-2.5 rounded-xl border transition-all ${
                showOnlyWishlist || wishlist.length > 0
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
              title="Saved Wishlist Items"
              data-cursor-text="SAVED"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-rose-400' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#00ffc4]/15 border border-[#00ffc4]/40 text-[#00ffc4] hover:bg-[#00ffc4]/25 transition-all shadow-[0_0_15px_rgba(0,255,196,0.15)]"
              data-cursor-text="CART"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold font-mono">
                {totalCartCount > 0 ? `$${cartSubtotal.toFixed(2)}` : 'Cart'}
              </span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#00ffc4] text-black text-[10px] font-black flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Discord CTA */}
            <a
              href="https://discord.gg/digivault"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-bold text-indigo-300 transition-colors"
              data-cursor-text="DISCORD"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Discord Support
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-[#07080f]/95 backdrop-blur-2xl pt-24 px-6 pb-10 flex flex-col justify-between lg:hidden text-white"
          >
            <div className="space-y-6 text-center">
              <button
                onClick={() => scrollToSection('products')}
                className="block w-full py-3 font-heading font-bold text-2xl uppercase hover:text-[#00ffc4]"
              >
                Products Catalog
              </button>
              <button
                onClick={() => scrollToSection('bundles')}
                className="block w-full py-3 font-heading font-bold text-2xl uppercase hover:text-[#00ffc4]"
              >
                Curated Bundles
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full py-3 font-heading font-bold text-2xl uppercase hover:text-[#00ffc4]"
              >
                Why DigiVault
              </button>
              <button
                onClick={() => scrollToSection('reviews')}
                className="block w-full py-3 font-heading font-bold text-2xl uppercase hover:text-[#00ffc4]"
              >
                Customer Reviews
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full py-3 font-heading font-bold text-2xl uppercase hover:text-[#00ffc4]"
              >
                FAQ
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsOrderLookupOpen(true);
                }}
                className="block w-full py-3 font-mono text-sm text-[#00ffc4] uppercase font-bold"
              >
                Look Up License Keys
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsCartOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-[#00ffc4] text-black font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                View Cart ({totalCartCount} items)
              </button>
              <a
                href="https://discord.gg/digivault"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-200 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2"
              >
                Join 24/7 Discord Community
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Trust Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#00ffc4]/10 border border-[#00ffc4]/25 text-[#00ffc4] text-xs font-mono font-semibold mb-6 shadow-[0_0_20px_rgba(0,255,196,0.15)]"
        >
          <span className="w-2 h-2 rounded-full bg-[#00ffc4] animate-ping" />
          <span>TRUSTED BY 10,000+ CREATORS & DEVELOPERS</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-white/70 hidden sm:inline">INSTANT AUTOMATED DELIVERY</span>
        </motion.div>

        {/* Main Glitch Gradient Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-6"
        >
          <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight">
            Premium Digital <br className="hidden sm:inline" />
            <GradientText text="Subscriptions" as="span" /> <br />
            at Unbeatable Prices.
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/70 leading-relaxed font-light mb-10"
        >
          Get instant access to Canva Pro, Figma Edu, Microsoft Office 365, JetBrains, Notion AI, and 50+ world-class software suites — with a 100% full replacement warranty.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mb-16"
        >
          <button
            onClick={() => scrollToSection('products')}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_30px_rgba(4,120,87,0.5)] active:scale-[0.98] transition-all"
            data-cursor-text="SHOP"
          >
            Browse All Products
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsOrderLookupOpen(true)}
            className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
            data-cursor-text="KEYS"
          >
            <Package className="w-4 h-4 text-[#00ffc4]" />
            Look Up My Keys
          </button>
        </motion.div>

        {/* 4 Metric Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto"
        >
          {[
            { value: '10,000+', label: 'Happy Customers', sub: 'Worldwide' },
            { value: '50+ Apps', label: 'In Stock Today', sub: 'Genuine bulk licenses' },
            { value: '99.8%', label: 'Satisfaction Rate', sub: 'Replacement warranty' },
            { value: '< 2 Mins', label: 'Avg Delivery Time', sub: '100% Automated receipt' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center hover:border-[#00ffc4]/30 hover:bg-white/[0.05] transition-all"
            >
              <div className="font-heading font-black text-2xl sm:text-3xl text-white text-gradient">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-white/90 mt-1">{stat.label}</div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* LIVE SCROLLING TICKER */}
      <section className="border-y border-white/10 bg-[#0c0d1b]/80 py-3.5 overflow-hidden">
        <div className="ticker-track">
          <div className="flex items-center gap-12 px-6 text-xs font-mono text-white/70">
            <span className="flex items-center gap-2 text-[#00ffc4]">
              <Zap className="w-3.5 h-3.5 fill-[#00ffc4]" /> INSTANT AUTOMATED KEY DELIVERY
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> FULL REPLACEMENT WARRANTY
            </span>
            <span className="flex items-center gap-2 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300" /> 10,000+ VERIFIED CUSTOMERS
            </span>
            <span className="flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5 text-indigo-400" /> 24/7 DISCORD SUPPORT
            </span>
            <span className="flex items-center gap-2 text-rose-400">
              <BadgePercent className="w-3.5 h-3.5" /> UP TO 95% OFF RETAIL
            </span>
            <span className="flex items-center gap-2 text-[#00ffc4]">
              <Sparkles className="w-3.5 h-3.5" /> USE CODE: <strong>LUMINA10</strong> FOR 10% OFF
            </span>
          </div>
          <div className="flex items-center gap-12 px-6 text-xs font-mono text-white/70">
            <span className="flex items-center gap-2 text-[#00ffc4]">
              <Zap className="w-3.5 h-3.5 fill-[#00ffc4]" /> INSTANT AUTOMATED KEY DELIVERY
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> FULL REPLACEMENT WARRANTY
            </span>
            <span className="flex items-center gap-2 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300" /> 10,000+ VERIFIED CUSTOMERS
            </span>
            <span className="flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5 text-indigo-400" /> 24/7 DISCORD SUPPORT
            </span>
            <span className="flex items-center gap-2 text-rose-400">
              <BadgePercent className="w-3.5 h-3.5" /> UP TO 95% OFF RETAIL
            </span>
            <span className="flex items-center gap-2 text-[#00ffc4]">
              <Sparkles className="w-3.5 h-3.5" /> USE CODE: <strong>LUMINA10</strong> FOR 10% OFF
            </span>
          </div>
        </div>
      </section>

      {/* CURATED VALUE BUNDLES */}
      <section id="bundles" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00ffc4] bg-[#00ffc4]/10 px-3 py-1 rounded-full border border-[#00ffc4]/20 inline-block mb-3">
            POPULAR BUNDLE SAVINGS
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white">
            Curated Power Bundles
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2 font-light">
            All-in-one software combinations configured for high-output workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bundle 1: Design Studio */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e1c]/80 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[#00ffc4]/40 hover:shadow-[0_0_30px_rgba(0,255,196,0.12)] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/25">
                  ⭐ DESIGN AGENCY
                </span>
                <span className="text-xs font-mono text-[#00ffc4] font-bold">96% SAVINGS</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">
                Creative Pro Suite
              </h3>
              <p className="text-xs text-white/60 mb-4 font-light">
                Canva Pro (2 Yrs) + Figma Pro Edu (2 Yrs) + Adobe Express (1 Yr).
              </p>
              <div className="space-y-2 mb-6">
                {['Canva Pro 2-Year Magic Studio', 'Figma Pro Unlimited Dev Mode', 'Adobe Express Firefly AI'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#00ffc4]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-white/40 line-through font-mono">$70.98 value</div>
                <div className="font-heading font-black text-2xl text-[#00ffc4]">$2.37</div>
              </div>
              <button
                onClick={() => handleAddBundle('Creative Pro Suite', [1, 3, 4])}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Bundle
              </button>
            </div>
          </div>

          {/* Bundle 2: Dev Powerhouse */}
          <div className="rounded-3xl border border-[#00ffc4]/30 bg-[#0f1124]/90 backdrop-blur-md p-6 flex flex-col justify-between relative shadow-[0_0_35px_rgba(0,255,196,0.15)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ffc4] text-black font-mono font-bold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
              🔥 MOST POPULAR
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-bold text-[#00ffc4] bg-[#00ffc4]/15 px-2.5 py-1 rounded-full border border-[#00ffc4]/30">
                  ⚡ DEVELOPER STACK
                </span>
                <span className="text-xs font-mono text-[#00ffc4] font-bold">98% SAVINGS</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">
                Full Stack Architect
              </h3>
              <p className="text-xs text-white/60 mb-4 font-light">
                JetBrains All 16 IDEs (1 Yr) + Windows 11 Pro Lifetime + Gemini 1.5 Pro AI.
              </p>
              <div className="space-y-2 mb-6">
                {['16 JetBrains IDEs (IntelliJ, WebStorm, PyCharm)', 'Windows 11 Pro Genuine OEM License', 'Gemini Pro 1M Context + 2TB Google One'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#00ffc4]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-white/40 line-through font-mono">$848.99 value</div>
                <div className="font-heading font-black text-2xl text-[#00ffc4]">$6.97</div>
              </div>
              <button
                onClick={() => handleAddBundle('Full Stack Architect', [14, 16, 17])}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Bundle
              </button>
            </div>
          </div>

          {/* Bundle 3: Productivity & Office */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0e1c]/80 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[#00ffc4]/40 hover:shadow-[0_0_30px_rgba(0,255,196,0.12)] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-full border border-purple-400/25">
                  📋 PRODUCTIVITY MAX
                </span>
                <span className="text-xs font-mono text-[#00ffc4] font-bold">95% SAVINGS</span>
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-2">
                Executive Workspace
              </h3>
              <p className="text-xs text-white/60 mb-4 font-light">
                Office 365 + 1TB Cloud (1 Yr) + Notion Plus AI (1 Yr) + iLovePdf.
              </p>
              <div className="space-y-2 mb-6">
                {['Microsoft Office 365 Desktop for 5 devices', 'Notion Plus + Notion AI writing engine', '1,000 GB OneDrive Cloud Storage'].map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/80">
                    <Check className="w-3.5 h-3.5 text-[#00ffc4]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-white/40 line-through font-mono">$237.99 value</div>
                <div className="font-heading font-black text-2xl text-[#00ffc4]">$3.97</div>
              </div>
              <button
                onClick={() => handleAddBundle('Executive Workspace', [6, 8, 9])}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#059669] hover:to-[#10b981] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Bundle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN PRODUCTS CATALOG SECTION */}
      <section id="products" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Catalog Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00ffc4] bg-[#00ffc4]/10 px-3 py-1 rounded-full border border-[#00ffc4]/20 inline-block mb-3">
            EXPLORE SOFTWARE CATALOG
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
            All Digital <GradientText text="Products" as="span" />
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2 font-light">
            Instant digital access with full replacement warranty and 24/7 customer support.
          </p>
        </div>

        {/* Search & Sort & Filters Bar */}
        <div className="flex flex-col gap-5 mb-8">
          {/* Search Box & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl mx-auto w-full">
            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Canva, Figma, Office, Netflix, JetBrains, CapCut..."
                className="w-full bg-[#0d0e1c]/90 border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00ffc4]/50 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto bg-[#0d0e1c] border border-white/10 rounded-2xl px-4 py-3 text-xs font-mono text-white/80 focus:outline-none focus:border-[#00ffc4]/50 appearance-none pr-8 cursor-pointer"
                >
                  <option value="featured">⭐ Featured First</option>
                  <option value="rating">🔥 Highest Rated</option>
                  <option value="price-asc">💰 Price: Low to High</option>
                  <option value="price-desc">💎 Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>

              {/* Wishlist filter toggle */}
              {wishlist.length > 0 && (
                <button
                  onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
                  className={`px-3 py-3 rounded-2xl border text-xs font-mono flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    showOnlyWishlist
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${showOnlyWishlist ? 'fill-rose-400' : ''}`} />
                  <span>Saved ({wishlist.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-start md:justify-center no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all whitespace-nowrap border ${
                    isActive
                      ? 'bg-[#00ffc4] text-black border-[#00ffc4] font-bold shadow-[0_0_20px_rgba(0,255,196,0.3)]'
                      : 'bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/20'
                  }`}
                  data-cursor-text={cat.id.toUpperCase()}
                >
                  <IconRenderer name={cat.icon} className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-3xl max-w-xl mx-auto">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg text-white">No products found</h3>
            <p className="text-xs text-white/50 mt-1 mb-6">
              Try adjusting your search keywords or switching categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowOnlyWishlist(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((i) => i.product.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  inCart={!!inCartItem}
                  cartQty={inCartItem?.qty || 0}
                  isWishlisted={wishlist.includes(product.id)}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onOpenDetails={setActiveProductModal}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* WHY CHOOSE DIGIVAULT SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00ffc4] bg-[#00ffc4]/10 px-3 py-1 rounded-full border border-[#00ffc4]/20 inline-block mb-3">
            UNRIVALED VALUE & TRUST
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            Why Professionals Choose <GradientText text="DigiVault" as="span" />
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2 font-light">
            We make enterprise software tools and creative suites accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Zap,
              title: 'Instant Delivery',
              desc: 'Receive your license credentials, panel invitation, or product keys on-screen in under 2 minutes.',
            },
            {
              icon: ShieldCheck,
              title: 'Full Warranty',
              desc: 'Every item is backed by a 100% replacement warranty covering your entire active subscription duration.',
            },
            {
              icon: Headphones,
              title: '24/7 Live Support',
              desc: 'Direct VIP assistance on Discord and email with dedicated staff available around the clock.',
            },
            {
              icon: BadgePercent,
              title: 'Up to 95% Off',
              desc: 'Leverage bulk licensing and direct volume partnerships to save thousands on your creative stack.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0d0e1c]/70 border border-white/10 backdrop-blur-sm text-center hover:border-[#00ffc4]/30 hover:bg-[#121324] transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#00ffc4]/10 border border-[#00ffc4]/20 text-[#00ffc4] flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(0,255,196,0.15)]">
                <item.icon className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white mb-2">{item.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VERIFIED CUSTOMER REVIEWS */}
      <section id="reviews" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00ffc4] bg-[#00ffc4]/10 px-3 py-1 rounded-full border border-[#00ffc4]/20 inline-block mb-3">
            VERIFIED ORDERS
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2 font-light">
            Real feedback from software engineers, video editors, and agency founders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-3xl bg-[#0d0e1c]/80 border border-white/10 backdrop-blur-sm flex flex-col justify-between hover:border-[#00ffc4]/30 transition-all"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic mb-6">
                  "{review.content}"
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
                <div>
                  <div className="font-heading font-bold text-xs text-white">{review.name}</div>
                  <div className="text-[11px] text-white/50">{review.role}</div>
                  <div className="text-[10px] font-mono text-[#00ffc4] mt-0.5">
                    Purchased: {review.productPurchased}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00ffc4] bg-[#00ffc4]/10 px-3 py-1 rounded-full border border-[#00ffc4]/20 inline-block mb-3">
            NEED CLARIFICATION?
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#0d0e1c]/70 overflow-hidden transition-all hover:border-white/20"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-heading font-semibold text-sm sm:text-base text-white">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-lg bg-white/5 text-white/60 transition-transform ${isOpen ? 'rotate-180 text-[#00ffc4]' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 pt-0 text-xs sm:text-sm text-white/70 leading-relaxed border-t border-white/5 mt-1 font-light"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* DISCORD COMMUNITY & SUPPORT BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950/60 via-[#0d0e1c] to-emerald-950/60 border border-white/15 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ffc4]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-6 h-6" />
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mb-3">
              Need Assistance or Custom Enterprise Orders?
            </h2>
            <p className="text-xs sm:text-sm text-white/70 font-light mb-8 leading-relaxed">
              Join our official Discord server with 10,000+ members for flash giveaways, instant replacement tickets, and direct support.
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <a
                href="https://discord.gg/digivault"
                target="_blank"
                rel="noreferrer"
                className="px-8 py-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(88,101,242,0.4)] transition-all"
                data-cursor-text="JOIN"
              >
                Join Discord Server
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOrderLookupOpen(true)}
                className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all"
              >
                <Package className="w-4 h-4 text-[#00ffc4]" />
                Retrieve Past License Key
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#07080f] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#047857] to-[#00ffc4] flex items-center justify-center text-black">
              <Zap className="w-4 h-4 fill-black" />
            </div>
            <div>
              <span className="font-heading font-black text-sm text-white tracking-tight">
                DIGIVAULT
              </span>
              <p className="text-[11px] text-white/40">Premium Digital Subscriptions & Licenses</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-white/50">
            <button onClick={() => scrollToSection('products')} className="hover:text-white">
              Catalog
            </button>
            <button onClick={() => scrollToSection('features')} className="hover:text-white">
              Warranty Policy
            </button>
            <button onClick={() => setIsOrderLookupOpen(true)} className="hover:text-white">
              Order Lookup
            </button>
            <a href="https://discord.gg/digivault" target="_blank" rel="noreferrer" className="hover:text-white">
              Discord
            </a>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-white/20 hover:text-white/60 transition-colors p-1"
              title="Staff Portal (Restricted)"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>

          <p className="text-[11px] text-white/40">
            © {new Date().getFullYear()} DigiVault. All trademarks and brand names belong to their respective owners.
          </p>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={productsList}
        orders={cloudOrders.length > 0 ? cloudOrders : savedOrders}
        showToast={showToast}
      />

      <ProductDetailModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        inCart={!!cart.find((i) => i.product.id === activeProductModal?.id)}
        cartQty={cart.find((i) => i.product.id === activeProductModal?.id)?.qty || 0}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        appliedPromo={appliedPromo}
        onApplyPromo={setAppliedPromo}
        onChangeQty={handleChangeQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOpenCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onBrowseProducts={() => scrollToSection('products')}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        appliedPromo={appliedPromo}
        onOrderCompleted={handleOrderCompleted}
      />

      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        savedOrders={savedOrders}
      />

      {/* AI ASSISTANT CHAT */}
      <AIChat />

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#0c0d1b]/95 border border-[#00ffc4]/30 text-white text-xs font-semibold shadow-2xl shadow-[#00ffc4]/20 backdrop-blur-xl flex items-center gap-2.5 pointer-events-none"
          >
            <div className="w-2 h-2 rounded-full bg-[#00ffc4] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
