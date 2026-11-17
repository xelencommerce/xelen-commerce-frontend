import { FileBadge, House, IdCard, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DocumentKind } from '../types/signup';

export const industries = [
  'Fashion & Accessories',
  'Beauty & Personal Care',
  'Food & Beverages',
  'Electronics & Gadgets',
  'Home & Lifestyle',
  'Arts, Crafts & Handmade',
  'Health, Fitness & Wellness',
  'Digital Products & Software',
  'Education & Coaching',
  'Creators & Communities',
  'Services & Consulting',
  'Events & Experiences',
  'Nonprofits & Fundraising',
  'Multiple Categories',
  'Other',
] as const;

export const documentDefinitions: {
  kind: DocumentKind;
  label: string;
  help: string;
  group: 'business' | 'owner';
  icon: LucideIcon;
}[] = [
  {
    kind: 'incorporation',
    label: 'Certificate of incorporation',
    help: 'PDF, JPG or PNG · max 10 MB',
    group: 'business',
    icon: FileBadge,
  },
  {
    kind: 'businessAddress',
    label: 'Proof of business address',
    help: 'Utility bill or bank statement from the last 3 months',
    group: 'business',
    icon: MapPin,
  },
  {
    kind: 'ownerId',
    label: 'Government-issued ID',
    help: 'Passport, national ID card or driver’s license',
    group: 'owner',
    icon: IdCard,
  },
  {
    kind: 'personalAddress',
    label: 'Proof of personal address',
    help: 'Utility bill or bank statement from the last 3 months',
    group: 'owner',
    icon: House,
  },
];

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
