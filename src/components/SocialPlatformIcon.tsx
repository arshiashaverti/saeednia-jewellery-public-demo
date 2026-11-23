import React from 'react';
import {
  Globe,
  Share2,
  MessageCircle,
  Video,
  Camera,
  Sparkles,
  ShoppingBag,
  Award,
  Send,
  Link2,
} from 'lucide-react';
import type { CustomSocialIconKey, SocialMediaPlatformKey } from '../types';

interface SocialPlatformIconProps {
  platform: SocialMediaPlatformKey;
  customIconKey?: CustomSocialIconKey;
  className?: string;
}

/**
 * Curated, XSS-safe React icon registry.
 * Supports official inline brand SVG glyphs and a fixed Lucide set for custom links.
 * Never accepts raw uploaded SVGs or arbitrary HTML strings.
 */
export const SocialPlatformIcon: React.FC<SocialPlatformIconProps> = ({
  platform,
  customIconKey = 'globe',
  className = 'w-5 h-5',
}) => {
  switch (platform) {
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M21.5 3.5L2.5 11l6.5 2.5 2.5 6.5 3.5-4.5 5 3.5 1.5-15.5z" />
          <path d="M9 13.5l8.5-7" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case 'x':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M4 4l11.733 16h4.267l-11.733-16z" />
          <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M10.5 15.5L12 9.5c.8-1 2.5-.8 2.8.8.3 1.4-.6 2.8-1.9 2.8-.6 0-1-.3-1.2-.8" />
          <path d="M9.5 19l1-3.5" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'aparat':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <circle cx="9.5" cy="9.5" r="1.5" />
          <circle cx="14.5" cy="9.5" r="1.5" />
          <circle cx="9.5" cy="14.5" r="1.5" />
          <circle cx="14.5" cy="14.5" r="1.5" />
        </svg>
      );
    case 'eitaa':
    case 'bale':
    case 'rubika':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.9-.95L3 21l1.95-5.6A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 1 1 21 11.5z" />
          <path d="M8.5 11.5h7" />
          <path d="M12 8v7" />
        </svg>
      );
    case 'website':
      return <Globe className={className} aria-hidden="true" />;
    case 'custom':
    default: {
      switch (customIconKey) {
        case 'share':
          return <Share2 className={className} aria-hidden="true" />;
        case 'message':
          return <MessageCircle className={className} aria-hidden="true" />;
        case 'video':
          return <Video className={className} aria-hidden="true" />;
        case 'camera':
          return <Camera className={className} aria-hidden="true" />;
        case 'sparkles':
          return <Sparkles className={className} aria-hidden="true" />;
        case 'shopping-bag':
          return <ShoppingBag className={className} aria-hidden="true" />;
        case 'award':
          return <Award className={className} aria-hidden="true" />;
        case 'send':
          return <Send className={className} aria-hidden="true" />;
        case 'link':
          return <Link2 className={className} aria-hidden="true" />;
        case 'globe':
        default:
          return <Globe className={className} aria-hidden="true" />;
      }
    }
  }
};
