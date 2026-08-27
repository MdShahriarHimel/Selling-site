/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrderReceipt } from '../types';
import { Search, X, Check, Copy, Package, Calendar, Clock, Download } from 'lucide-react';

interface OrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedOrders: OrderReceipt[];
}

export const OrderLookupModal: React.FC<OrderLookupModalProps> = ({
  isOpen,
  onClose,
  savedOrders,
}) => {
  const [query, setQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredOrders = savedOrders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(query.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(query.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(query.toLowerCase()))
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0c0d1b] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-auto z-10 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#00ffc4]/15 border border-[#00ffc4]/30 flex items-center justify-center text-[#00ffc4]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-white">License Key & Order Lookup</h3>
            <p className="text-xs text-white/50">Look up all your active digital subscriptions and credentials</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Order ID (e.g. DV-123456) or Email Address..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#00ffc4]/50 transition-colors"
          />
        </div>

        {/* Orders Result List */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl">
              <Package className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/50">
                {savedOrders.length === 0
                  ? 'No past orders yet. Place a new order to view instant licenses here.'
                  : 'No orders matched your search query.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#00ffc4]/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs border-b border-white/10 pb-2.5">
                  <div>
                    <span className="font-mono font-bold text-[#00ffc4] text-sm">{order.orderId}</span>
                    <span className="text-white/40 ml-2">({order.customerEmail})</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 font-mono text-[11px]">
                    <span>{order.createdAt}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5"
                    >
                      <div className="min-w-0">
                        <div className="font-heading font-semibold text-xs text-white truncate">
                          {item.name} <span className="text-white/40 font-mono text-[11px]">({item.duration})</span>
                        </div>
                        <div className="font-mono text-[11px] text-[#00ffc4] truncate mt-0.5">
                          {item.licenseKey}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopy(item.licenseKey)}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-[#00ffc4]/20 hover:text-[#00ffc4] text-white/60 transition-colors shrink-0"
                        title="Copy Key"
                      >
                        {copiedKey === item.licenseKey ? (
                          <Check className="w-3.5 h-3.5 text-[#00ffc4]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-white/60 pt-1">
                  <span>Paid: ${order.total.toFixed(2)} via {order.paymentMethod}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderLookupModal;
