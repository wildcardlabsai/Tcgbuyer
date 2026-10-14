export interface Submission {
  reference: string;
  date: string;
  collection: string;
  cards: number;
  estValue: string;
  status: 'Review' | 'Offer Sent' | 'New' | 'Completed' | 'Declined';
}

export const submissions: Submission[] = [
  { reference: '#TCG-1047', date: '12 Oct 2026', collection: 'Mixed TCG', cards: 142, estValue: '£1,340', status: 'Review' },
  { reference: '#TCG-1046', date: '11 Oct 2026', collection: 'Pokémon', cards: 86, estValue: '£620', status: 'Offer Sent' },
  { reference: '#TCG-1045', date: '11 Oct 2026', collection: 'Magic: The Gathering', cards: 214, estValue: '£1,850', status: 'New' },
  { reference: '#TCG-1044', date: '10 Oct 2026', collection: 'Yu-Gi-Oh', cards: 57, estValue: '£320', status: 'Completed' },
  { reference: '#TCG-1043', date: '09 Oct 2026', collection: 'Pokémon', cards: 301, estValue: '£2,480', status: 'Review' },
];

export interface Activity {
  icon: 'submission' | 'offer' | 'accepted' | 'purchase';
  text: string;
  time: string;
}

export const recentActivity: Activity[] = [
  { icon: 'submission', text: 'New submission received #TCG-1047', time: '5 minutes ago' },
  { icon: 'offer', text: 'Offer sent to customer #TCG-1046', time: '28 minutes ago' },
  { icon: 'accepted', text: 'Customer accepted offer #TCG-1041', time: '2 hours ago' },
  { icon: 'purchase', text: 'Purchase completed #TCG-1039', time: '5 hours ago' },
];

export const dashboardStats = {
  newSubmissions: 12,
  awaitingReview: 8,
  offersSent: 6,
  completedPurchases: 14,
};

export interface PortalCard {
  game: string;
  count: number;
  value: string;
}

export const portalCards: PortalCard[] = [
  { game: 'Pokémon', count: 71, value: '£430' },
  { game: 'Magic: The Gathering', count: 3, value: '£390' },
  { game: 'Yu-Gi-Oh', count: 12, value: '£120' },
];
