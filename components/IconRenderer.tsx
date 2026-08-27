/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Palette,
  Users,
  Figma,
  Sparkles,
  Layout,
  BookOpen,
  Map,
  FileText,
  FileCheck,
  CheckCircle,
  PlayCircle,
  Tv,
  Clapperboard,
  Code2,
  Box,
  Monitor,
  Brain,
  GraduationCap,
  Scissors,
  Mail,
  AtSign,
  Shield,
  Zap,
  Tag,
  Headphones,
  BadgePercent,
  Search,
  ShoppingCart,
  Heart,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Download,
  Copy,
  CreditCard,
  DollarSign,
  HelpCircle,
  Flame,
  MessageSquare,
  Gift,
  ShieldCheck,
  Award,
  Globe,
  SlidersHorizontal,
  LucideProps,
} from 'lucide-react';

interface IconRendererProps extends LucideProps {
  name: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, ...props }) => {
  const normalized = name.toLowerCase().replace(/[-_]/g, '');

  switch (normalized) {
    case 'palette':
      return <Palette {...props} />;
    case 'users':
      return <Users {...props} />;
    case 'figma':
      return <Figma {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    case 'layout':
      return <Layout {...props} />;
    case 'bookopen':
    case 'book':
      return <BookOpen {...props} />;
    case 'map':
      return <Map {...props} />;
    case 'filetext':
      return <FileText {...props} />;
    case 'filecheck':
      return <FileCheck {...props} />;
    case 'checkcircle':
      return <CheckCircle {...props} />;
    case 'playcircle':
      return <PlayCircle {...props} />;
    case 'tv':
      return <Tv {...props} />;
    case 'clapperboard':
      return <Clapperboard {...props} />;
    case 'code2':
    case 'code':
      return <Code2 {...props} />;
    case 'box':
      return <Box {...props} />;
    case 'monitor':
      return <Monitor {...props} />;
    case 'brain':
      return <Brain {...props} />;
    case 'graduationcap':
      return <GraduationCap {...props} />;
    case 'scissors':
      return <Scissors {...props} />;
    case 'mail':
      return <Mail {...props} />;
    case 'atsign':
      return <AtSign {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'shieldcheck':
      return <ShieldCheck {...props} />;
    case 'zap':
      return <Zap {...props} />;
    case 'headphones':
      return <Headphones {...props} />;
    case 'badgepercent':
    case 'percent':
      return <BadgePercent {...props} />;
    case 'heart':
      return <Heart {...props} />;
    case 'shoppingcart':
      return <ShoppingCart {...props} />;
    case 'tag':
      return <Tag {...props} />;
    case 'award':
      return <Award {...props} />;
    case 'globe':
      return <Globe {...props} />;
    default:
      return <Sparkles {...props} />;
  }
};

export default IconRenderer;
