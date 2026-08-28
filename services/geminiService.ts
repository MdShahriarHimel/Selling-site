/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';

const API_KEY = process.env.API_KEY || '';

let chatSession: Chat | null = null;

export const initializeChat = (): Chat | null => {
  if (chatSession) return chatSession;
  if (!API_KEY) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are 'VAULT AI', the intelligent digital software and subscription assistant for DigiVault.
        
        Store Mission:
        DigiVault sells premium software subscriptions, cloud storage, educational licenses, and digital productivity tools at up to 95% off retail.
        
        Catalog & Pricing:
        - Design: Canva Pro ($0.19 / 2 yrs), Canva Pro Admin 500 Invites ($2.99), Figma Pro Edu ($1.99 / 2 yrs), Adobe Express ($0.19 / 1 yr), Framer AI ($6.00 / 1 yr).
        - Productivity: Notion Plus + AI ($1.49 / 1 yr), Miro Lifetime Panel ($4.99), Microsoft Office 365 + 1TB OneDrive ($1.99 / 1 yr), iLovePdf ($0.49 / 1 yr), Grammarly Premium ($0.39 / 1 mo).
        - Streaming: Netflix 4K UHD 5-Profiles ($1.49 / mo), HBO Max ($0.49 / mo), Peacock Premium ($0.19 / mo).
        - Development & OS: JetBrains All Products 16 IDEs ($3.99 / 1 yr), Autodesk All Apps ($4.99 / 1 yr), Windows 11/10 Pro Lifetime OEM ($0.99).
        - AI & Learning: Gemini Advanced AI + 2TB ($1.99 / 18 mos), edX Premium ($1.49 / 1 yr).
        - Video: CapCut Pro VIP ($0.49 / 6 mos, $0.19 / mo, $0.89 / 1 yr).
        - Utility: iCloud Mail ($0.05), Outlook / Hotmail PVA ($0.05), Avira Prime Antivirus & VPN ($0.39 / 3 mos).
        
        Key Guarantees:
        - Automated instant delivery (<2 minutes).
        - Full duration replacement warranty.
        - Supported Payments: Cards, Crypto (USDT/BTC/ETH), PayPal, Discord.
        - Active Promo: LUMINA10 (10% off), DIGI20 (20% off).
        
        Tone: Helpful, concise, knowledgeable tech expert. Keep answers under 60 words and friendly with emojis.`,
      },
    });

    return chatSession;
  } catch (err) {
    console.warn("Could not create Gemini chat session:", err);
    return null;
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!API_KEY) {
    // Intelligent fallback responses if no API key is set
    const lower = message.toLowerCase();
    if (lower.includes('canva')) {
      return "🎨 Canva Pro is just $0.19 for 2 Years (Brand Kit & Magic AI included)! For agencies, our Canva Admin panel ($2.99) includes 500 member invite slots.";
    }
    if (lower.includes('figma') || lower.includes('design')) {
      return "✨ Figma Pro Edu is $1.99 for 2 years with unlimited files & Dev Mode! We also offer Adobe Express & Framer AI.";
    }
    if (lower.includes('coupon') || lower.includes('discount') || lower.includes('promo')) {
      return "🎁 Use promo code 'LUMINA10' at checkout for 10% off, or 'DIGI20' for 20% off your cart!";
    }
    if (lower.includes('delivery') || lower.includes('how')) {
      return "⚡ Delivery is 100% automated! You receive your license key or invite token on-screen right on your receipt in under 2 minutes.";
    }
    if (lower.includes('office') || lower.includes('microsoft')) {
      return "📋 Microsoft Office 365 + 1TB OneDrive is $1.99 for 1 year, usable on up to 5 PCs/Macs + 5 mobile devices.";
    }
    if (lower.includes('gemini') || lower.includes('ai')) {
      return "🤖 Gemini Advanced AI with 1M token context & 2TB Google One Cloud is $1.99 for 18 months!";
    }
    return "⚡ I'm Vault AI! Ask me anything about our software tools, license activation, coupons, or recommendations.";
  }

  try {
    const chat = initializeChat();
    if (!chat) {
      return "⚡ All digital subscriptions are in stock with instant automated delivery! What software or tool can I help you find?";
    }
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm here to help with all DigiVault subscriptions. What software are you looking for?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "⚡ All digital subscriptions are in stock with instant automated delivery! What can I help you choose?";
  }
};
