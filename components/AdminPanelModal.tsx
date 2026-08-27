/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Database,
  RefreshCw,
  ShoppingBag,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  Search,
  Lock,
  Eye,
  Tag,
  Key,
  Calendar,
  Save,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Product, ProductCategory, ProductBadge, OrderReceipt } from '../types';
import IconRenderer from './IconRenderer';
import { saveProductToDb, deleteProductFromDb, resetDatabaseToDefaults } from '../services/firebaseDb';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: OrderReceipt[];
  onRefreshData?: () => void;
  showToast: (msg: string) => void;
}

const CATEGORIES_LIST: { id: ProductCategory; label: string }[] = [
  { id: 'design', label: 'Design & Creative' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'streaming', label: 'Streaming & Media' },
  { id: 'development', label: 'Dev Tools & OS' },
  { id: 'ai', label: 'AI & Learning' },
  { id: 'video', label: 'Video Editing' },
  { id: 'utility', label: 'Utilities & Mail' },
];

const AVAILABLE_ICONS = [
  'Palette', 'Users', 'Figma', 'Sparkles', 'Layout', 'BookOpen', 'Map',
  'FileText', 'FileCheck', 'CheckCircle', 'PlayCircle', 'Tv', 'Clapperboard',
  'Code2', 'Box', 'Monitor', 'Brain', 'GraduationCap', 'Scissors', 'Mail',
  'AtSign', 'Shield', 'Zap', 'Star', 'Key', 'Lock'
];

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onRefreshData,
  showToast,
}) => {
  // Authentication / Passcode
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('digivault_admin_auth') === 'true';
  });
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tabs: 'products' | 'orders' | 'database' | 'vercel'
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'database' | 'vercel'>('products');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Product Editor Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0.99);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(19.99);
  const [formBadge, setFormBadge] = useState<ProductBadge>('new');
  const [formCategory, setFormCategory] = useState<ProductCategory>('design');
  const [formIconName, setFormIconName] = useState('Sparkles');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFeatures, setFormFeatures] = useState<string[]>(['Instant automated license delivery', 'Full replacement warranty']);
  const [formFeatureInput, setFormFeatureInput] = useState('');
  const [formDeliveryType, setFormDeliveryType] = useState<'Instant Automated' | 'Panel Invite' | 'License Key'>('Instant Automated');
  const [formWarranty, setFormWarranty] = useState('12 Months Replacement Warranty');
  const [formStockCount, setFormStockCount] = useState<number>(50);

  // Revenue & Stats calculations
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.total || 0), 0);
  const totalItemsSold = orders.reduce((sum, ord) => sum + (ord.items?.reduce((s, i) => s + i.qty, 0) || 0), 0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master PIN is 1234 or admin
    if (adminPin.trim() === '1234' || adminPin.trim().toLowerCase() === 'admin' || adminPin.trim() === 'vault') {
      setIsAuthenticated(true);
      localStorage.setItem('digivault_admin_auth', 'true');
      setPinError(false);
      showToast('Admin access granted');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('digivault_admin_auth');
    showToast('Admin logged out');
  };

  const handleOpenCreateModal = () => {
    setIsCreatingNew(true);
    const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setEditingProduct({
      id: nextId,
      name: '',
      duration: '12 Months',
      price: 1.99,
      originalPrice: 29.99,
      badge: 'new',
      category: 'productivity',
      iconName: 'Sparkles',
      shortDesc: '',
      description: '',
      features: ['24/7 Automated Delivery', 'Guaranteed Replacement Warranty'],
      deliveryType: 'Instant Automated',
      warranty: '12 Months Replacement Warranty',
      stockCount: 100,
      rating: 5.0,
      reviewsCount: 1,
    });

    setFormName('');
    setFormDuration('12 Months');
    setFormPrice(1.99);
    setFormOriginalPrice(29.99);
    setFormBadge('new');
    setFormCategory('productivity');
    setFormIconName('Sparkles');
    setFormShortDesc('');
    setFormDescription('');
    setFormFeatures(['24/7 Automated Delivery', 'Guaranteed Replacement Warranty']);
    setFormDeliveryType('Instant Automated');
    setFormWarranty('12 Months Replacement Warranty');
    setFormStockCount(100);
  };

  const handleOpenEditModal = (p: Product) => {
    setIsCreatingNew(false);
    setEditingProduct(p);
    setFormName(p.name);
    setFormDuration(p.duration);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice || p.price * 5);
    setFormBadge(p.badge);
    setFormCategory(p.category);
    setFormIconName(p.iconName || 'Sparkles');
    setFormShortDesc(p.shortDesc);
    setFormDescription(p.description);
    setFormFeatures(p.features && p.features.length > 0 ? [...p.features] : ['Fast automated delivery']);
    setFormDeliveryType(p.deliveryType);
    setFormWarranty(p.warranty);
    setFormStockCount(p.stockCount);
  };

  const handleAddFeature = () => {
    if (formFeatureInput.trim()) {
      setFormFeatures([...formFeatures, formFeatureInput.trim()]);
      setFormFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, idx) => idx !== index));
  };

  const handleSaveProduct = async () => {
    if (!formName.trim()) {
      alert('Please enter a product name');
      return;
    }
    if (!editingProduct) return;

    setIsSaving(true);
    try {
      const productPayload: Product = {
        ...editingProduct,
        id: editingProduct.id,
        name: formName.trim(),
        duration: formDuration.trim() || '1 Year',
        price: Number(formPrice),
        originalPrice: Number(formOriginalPrice) || undefined,
        badge: formBadge,
        category: formCategory,
        iconName: formIconName,
        shortDesc: formShortDesc.trim() || `${formName} subscription plan.`,
        description: formDescription.trim() || formShortDesc.trim() || `${formName} premium license with guaranteed warranty.`,
        features: formFeatures.length > 0 ? formFeatures : ['Instant automated digital delivery'],
        deliveryType: formDeliveryType,
        warranty: formWarranty.trim() || '100% Replacement Guarantee',
        stockCount: Number(formStockCount) || 50,
        rating: editingProduct.rating || 5.0,
        reviewsCount: editingProduct.reviewsCount || 1,
      };

      await saveProductToDb(productPayload);
      showToast(`Saved "${productPayload.name}" to Cloud Database!`);
      setEditingProduct(null);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      console.error('Error saving product:', err);
      showToast(`Save failed: ${err.message || 'Database error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProductFromDb(id);
      showToast(`Product #${id} removed from Database`);
      setDeleteConfirmId(null);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      showToast(`Delete failed: ${err.message || 'Database error'}`);
    }
  };

  const handleResetToDefaults = async () => {
    if (window.confirm('Are you sure you want to reset all products in Firestore to the default 24 subscriptions catalog?')) {
      try {
        await resetDatabaseToDefaults();
        showToast('Firestore re-seeded with 24 default products!');
        if (onRefreshData) onRefreshData();
      } catch (err: any) {
        showToast(`Reset failed: ${err.message}`);
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.shortDesc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(p.id).includes(searchTerm);
    const matchesCat = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Main Admin Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-[#0b0f19] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100 z-10"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1424]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold tracking-tight text-white">DigiVault Master Control</h2>
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Firestore Live</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">Manage digital catalog, live prices, customer orders & Vercel deployment</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 rounded-lg transition-colors"
              >
                Lock Admin
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Gate or Main Content */}
        {!isAuthenticated ? (
          /* Password Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Protected Admin Dashboard</h3>
            <p className="text-sm text-slate-400 mb-6">
              Enter your master PIN to add products, modify pricing, delete subscriptions, or view buyer licenses in real-time.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="Enter PIN (Default: 1234)"
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  className={`w-full px-4 py-3 bg-slate-900/90 border rounded-xl text-center text-lg tracking-widest text-white placeholder-slate-500 focus:outline-none transition-all ${
                    pinError
                      ? 'border-rose-500 ring-2 ring-rose-500/20'
                      : 'border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center justify-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Incorrect PIN. (Tip: Try &quot;1234&quot; or &quot;admin&quot;)</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.99]"
              >
                Unlock Admin Console
              </button>

              <p className="text-[11px] text-slate-500">
                Default Master PIN: <span className="text-cyan-400 font-mono font-bold">1234</span>
              </p>
            </form>
          </div>
        ) : (
          /* Logged In Content */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Nav Tabs & Top Stats */}
            <div className="px-6 py-3 bg-slate-900/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-1 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'products'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Products Catalog ({products.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Sales & Licenses ({orders.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('database')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'database'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Firestore Sync</span>
                </button>
                <button
                  onClick={() => setActiveTab('vercel')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'vercel'
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vercel Deploy Guide</span>
                </button>
              </div>

              {/* Quick metrics banner */}
              <div className="flex items-center space-x-4 text-xs font-medium">
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Revenue:</span>
                  <span className="text-white font-bold font-mono">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex items-center space-x-1.5 text-slate-400">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Total Sales:</span>
                  <span className="text-white font-bold font-mono">{orders.length}</span>
                </div>
              </div>
            </div>

            {/* Tab 1: Products Management */}
            {activeTab === 'products' && (
              <div className="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2 flex-1 max-w-md">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search product by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES_LIST.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Table of Products */}
                <div className="flex-1 overflow-y-auto border border-white/10 rounded-xl bg-slate-950/50">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm z-10">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Product Name & Category</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Delivery / Warranty</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-500">
                            No products match your search query.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="py-3 px-4 font-mono text-slate-400 font-bold">
                              #{prod.id}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-cyan-400">
                                  <IconRenderer name={prod.iconName} className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-white">{prod.name}</span>
                                    {prod.badge && (
                                      <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase ${
                                        prod.badge === 'hot' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                                        prod.badge === 'popular' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                        prod.badge === 'lifetime' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                        'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                      }`}>
                                        {prod.badge}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-500 capitalize">{prod.category}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                                {prod.duration}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-emerald-400">${prod.price.toFixed(2)}</span>
                                {prod.originalPrice && (
                                  <span className="text-[10px] text-slate-500 line-through">
                                    ${prod.originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-[11px]">
                                <div className="text-slate-300">{prod.deliveryType}</div>
                                <div className="text-slate-500 text-[10px] truncate max-w-[160px]">{prod.warranty}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                                prod.stockCount > 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {prod.stockCount} in stock
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleOpenEditModal(prod)}
                                  className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {deleteConfirmId === prod.id ? (
                                  <div className="flex items-center space-x-1 bg-rose-950/80 border border-rose-500/40 p-1 rounded-lg">
                                    <button
                                      onClick={() => handleDeleteProduct(prod.id)}
                                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[10px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(prod.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Orders & Customer Sales */}
            {activeTab === 'orders' && (
              <div className="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Customer Orders & License Audit Log</h3>
                    <p className="text-xs text-slate-400">All completed checkouts and generated license keys synced from Firestore.</p>
                  </div>
                  <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-lg text-cyan-300">
                    {orders.length} Total Completed Orders
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto border border-white/10 rounded-xl bg-slate-950/50">
                  {orders.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-xs">
                      No orders placed yet. As customers check out, their invoices and license keys will appear here instantly.
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {orders.map((ord) => (
                        <div key={ord.orderId} className="p-4 hover:bg-white/[0.02] transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="font-mono text-xs font-bold text-cyan-400">{ord.orderId}</span>
                              <span className="text-xs text-slate-300 font-medium">{ord.customerEmail}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(ord.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 text-[10px] rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                {ord.paymentMethod}
                              </span>
                              <span className="font-mono font-bold text-emerald-400 text-sm">
                                ${(ord.total || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Purchased Items & Generated Keys */}
                          <div className="space-y-1.5 mt-2 bg-slate-900/60 p-3 rounded-lg border border-white/5">
                            {ord.items.map((item, idx) => (
                              <div key={idx} className="flex flex-wrap items-center justify-between text-xs gap-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-white font-medium">{item.name}</span>
                                  <span className="text-slate-400 text-[11px]">({item.duration}) × {item.qty}</span>
                                </div>
                                <div className="flex items-center space-x-2 font-mono text-[11px]">
                                  <span className="text-slate-400">Key:</span>
                                  <span className="px-2 py-0.5 rounded bg-black/60 text-emerald-400 border border-emerald-500/20 select-all">
                                    {item.licenseKey}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Database & Cloud Sync */}
            {activeTab === 'database' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-cyan-500/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Firestore Cloud Database Status</h3>
                      <p className="text-xs text-slate-400">Real-time two-way synchronization active with Google Cloud Firestore.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-xs text-slate-400 block mb-1">Products Synced</span>
                      <span className="text-2xl font-bold font-mono text-white">{products.length}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-xs text-slate-400 block mb-1">Logged Orders</span>
                      <span className="text-2xl font-bold font-mono text-cyan-400">{orders.length}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-xs text-slate-400 block mb-1">Active Coupons</span>
                      <span className="text-2xl font-bold font-mono text-emerald-400">3 (LUMINA10, DIGI20, VIP50)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={handleResetToDefaults}
                      className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all border border-white/10"
                    >
                      <RefreshCw className="w-4 h-4 text-cyan-400" />
                      <span>Re-seed Firestore with Default 24 Products</span>
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-2">How Real-Time Persistence Works</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Any change you make in this Admin Console (adding products, updating prices, modifying warranty/description, or deleting items) writes directly to Firestore in milliseconds. All customer browsers and devices automatically update live without needing a page refresh.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Vercel Deploy Guide */}
            {activeTab === 'vercel' && (
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-xl">
                      ▲
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Yes! You can deploy DigiVault to Vercel in 1 click</h3>
                      <p className="text-xs text-slate-400">Follow this simple 3-step guide to launch your custom domain store on Vercel for free.</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs text-slate-300 mt-4">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex items-center space-x-2 font-bold text-white mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[11px] font-bold">1</span>
                        <span>Export or Push to GitHub</span>
                      </div>
                      <p className="text-slate-400 ml-7">
                        Click the project settings in the top right and export as a ZIP file, or push this repository directly to your GitHub account.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex items-center space-x-2 font-bold text-white mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[11px] font-bold">2</span>
                        <span>Import Project in Vercel Dashboard</span>
                      </div>
                      <p className="text-slate-400 ml-7">
                        Log in to <strong className="text-white">vercel.com</strong>, click <strong className="text-white">&quot;Add New... &gt; Project&quot;</strong>, and select your DigiVault GitHub repository. Vercel will automatically detect <strong className="text-cyan-400">Vite / React</strong> with zero configuration needed.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex items-center space-x-2 font-bold text-white mb-1.5">
                        <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[11px] font-bold">3</span>
                        <span>(Optional) Environment Variables</span>
                      </div>
                      <p className="text-slate-400 ml-7">
                        If you want the Gemini AI Concierge active on Vercel, add <code className="text-cyan-400 bg-white/10 px-1.5 py-0.5 rounded">GEMINI_API_KEY</code> under <strong>Settings &gt; Environment Variables</strong> in your Vercel project settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Sub-Modal: Add / Edit Product Form */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[85vh] bg-[#0d1322] border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 z-10"
            >
              {/* Form Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {isCreatingNew ? 'Add New Product to Database' : `Edit Product #${editingProduct.id}`}
                    </h3>
                    <p className="text-xs text-slate-400">Instant real-time update in Cloud Firestore</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Product Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Spotify Premium, Canva Pro, Figma..."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Duration / Plan *</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Months, Lifetime, 1 Year..."
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Selling Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Retail Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Stock Count</label>
                    <input
                      type="number"
                      value={formStockCount}
                      onChange={(e) => setFormStockCount(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      {CATEGORIES_LIST.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Highlight Badge</label>
                    <select
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value as ProductBadge)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="">None</option>
                      <option value="hot">🔥 Hot</option>
                      <option value="new">✨ New</option>
                      <option value="popular">⭐ Popular</option>
                      <option value="lifetime">♾️ Lifetime</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Icon Style</label>
                    <select
                      value={formIconName}
                      onChange={(e) => setFormIconName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      {AVAILABLE_ICONS.map((ic) => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Short Description (Card summary)</label>
                  <input
                    type="text"
                    placeholder="One sentence summary of product features..."
                    value={formShortDesc}
                    onChange={(e) => setFormShortDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Description (Specs Modal)</label>
                  <textarea
                    rows={3}
                    placeholder="Full product specs, details, and usage scope..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Delivery Type</label>
                    <select
                      value={formDeliveryType}
                      onChange={(e) => setFormDeliveryType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Instant Automated">Instant Automated</option>
                      <option value="License Key">License Key</option>
                      <option value="Panel Invite">Panel Invite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Warranty Guarantee</label>
                    <input
                      type="text"
                      value={formWarranty}
                      onChange={(e) => setFormWarranty(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Features List */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Key Feature Bullet Points</label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add a bullet point feature..."
                      value={formFeatureInput}
                      onChange={(e) => setFormFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {formFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                        <span className="text-slate-300 text-xs truncate flex items-center space-x-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/10 bg-slate-900">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving to Cloud...' : 'Save Product to Database'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanelModal;
