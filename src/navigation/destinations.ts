export type NavDestinationId =
  | 'overview'
  | 'receipts'
  | 'scan-receipt'
  | 'price-intelligence'
  | 'planning'
  | 'budget'
  | 'products'
  | 'profile';

export interface NavDestination {
  id: NavDestinationId;
  label: string;
  /** lucide-react-native icon name */
  icon: string;
  route: string;
  emphasized?: boolean;
}

/**
 * The eight circular-navigation destinations, in clockwise order starting
 * from the top (12 o'clock / angle 0). Index order drives segment math in
 * CircularNavigationProvider — do not reorder without updating that math.
 */
export const NAV_DESTINATIONS: NavDestination[] = [
  { id: 'overview', label: 'Overview', icon: 'layout-dashboard', route: '/(main)' },
  { id: 'receipts', label: 'Receipts', icon: 'receipt', route: '/(main)/receipts' },
  { id: 'scan-receipt', label: 'Scan Receipt', icon: 'scan-line', route: '/scan', emphasized: true },
  { id: 'price-intelligence', label: 'Price Intel', icon: 'trending-up', route: '/(main)/price-intelligence' },
  { id: 'planning', label: 'Planning', icon: 'clipboard-list', route: '/(main)/planning' },
  { id: 'budget', label: 'Budget', icon: 'wallet', route: '/(main)/budget' },
  { id: 'products', label: 'Products', icon: 'package', route: '/(main)/products' },
  { id: 'profile', label: 'Profile', icon: 'user-round', route: '/(main)/profile' },
];

export const SEGMENT_ANGLE = 360 / NAV_DESTINATIONS.length;
