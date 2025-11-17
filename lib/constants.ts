// Order bump - Premium Chocolates
export const CHOCOLATES_PRICE = 99;

// Package configuration
export const PACKAGES = [
  {
    id: '1_dozen' as const,
    name: '1 Dozen Red Roses',
    roses: 12,
    price: 299,
    description: 'Perfect for a sweet gesture',
    image: '/1-dozen-roses.jpg',
  },
  {
    id: '2_dozen' as const,
    name: '2 Dozen Red Roses',
    roses: 24,
    price: 429,
    description: 'Our most popular choice',
    featured: true,
    image: '/2-dozen-roses.jpg',
  },
  {
    id: '3_dozen' as const,
    name: '3 Dozen Red Roses',
    roses: 36,
    price: 649,
    description: 'The ultimate grand gesture',
    image: '/3-dozen-roses.jpg',
  },
];

// Greeting card occasions
export const CARD_OCCASIONS = [
  'Anniversary',
  'Birthday',
  'Apology',
  'Just Because',
  'Thank You',
  'Congratulations',
  'Get Well Soon',
  'Thinking of You',
];

// Delivery hours
export const DELIVERY_HOURS = {
  open: 8, // 8 AM
  close: 20, // 8 PM (allows orders until 6 PM for 2-hour delivery)
  deliveryBuffer: 2, // 2 hours minimum
};

// Order status options
export const ORDER_STATUSES = [
  { value: 'received', label: 'Received' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

// Payment status options
export const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
] as const;

// Media logos for "As Seen On" section
export const MEDIA_LOGOS = [
  'Forbes',
  'TechCrunch',
  'Bloomberg',
  'The Wall Street Journal',
  'CNN',
];

// Sample testimonials
export const TESTIMONIALS = [
  {
    name: 'Michael R.',
    location: 'Scottsdale, AZ',
    text: 'Saved my anniversary! I completely forgot until 3PM and these guys delivered stunning roses by 5PM. My wife cried happy tears. Worth every penny.',
    rating: 5,
  },
  {
    name: 'David T.',
    location: 'Phoenix, AZ',
    text: 'The quality blew me away. These weren\'t just flowers, they were premium roses in a beautiful vase with a handwritten card. She was speechless.',
    rating: 5,
  },
  {
    name: 'James K.',
    location: 'Paradise Valley, AZ',
    text: 'Made up after a fight in record time. Ordered at 2PM, delivered by 4PM. The handwritten card was the perfect touch. Relationship saved!',
    rating: 5,
  },
  {
    name: 'Robert S.',
    location: 'Scottsdale, AZ',
    text: 'I\'m a busy executive and don\'t have time for flower shopping. This service is exactly what I needed - fast, premium quality, zero hassle.',
    rating: 5,
  },
  {
    name: 'Christopher M.',
    location: 'Phoenix, AZ',
    text: 'My girlfriend said these were the most beautiful flowers she\'s ever received. The 2 dozen package is perfect. Made me look like a hero!',
    rating: 5,
  },
  {
    name: 'William B.',
    location: 'Tempe, AZ',
    text: 'Best $400 I ever spent. Turned her birthday around when I realized I forgot to order in advance. They made it happen in 90 minutes!',
    rating: 5,
  },
];

// FAQ items
export const FAQ_ITEMS = [
  {
    question: 'Will my flowers really arrive in 2 hours or less?',
    answer: 'Yes! We guarantee delivery within 2 hours from the time you place your order, or your money back. We track every delivery and provide photo proof when your roses are delivered.',
  },
  {
    question: 'What if I\'m not satisfied with the quality?',
    answer: 'We offer a 100% money-back guarantee. If you or your recipient aren\'t absolutely thrilled with the premium quality of our roses, we\'ll refund your purchase - no questions asked.',
  },
  {
    question: 'Are these really premium roses?',
    answer: 'Absolutely. We source only the finest long-stem red roses, significantly superior to grocery store or standard florist roses. Each arrangement includes a premium vase and a personally handwritten Papyrus greeting card.',
  },
  {
    question: 'What if nobody\'s home to receive the delivery?',
    answer: 'We follow your specific delivery instructions and will contact the recipient if needed. We take a photo of the delivered arrangement as proof of delivery. If access isn\'t possible, we\'ll contact you immediately to arrange an alternative.',
  },
  {
    question: 'Can I trust you with this important occasion?',
    answer: 'We understand you\'re trusting us with something important. That\'s why we provide real-time tracking, delivery photo proof, a money-back guarantee, and have delivered thousands of successful orders. Check our testimonials from customers just like you.',
  },
  {
    question: 'Why are your roses more expensive than other options?',
    answer: 'You\'re not just paying for roses - you\'re paying for peace of mind. Our premium includes: guaranteed 2-hour delivery, superior rose quality, a handwritten card, a premium vase, delivery photo proof, and 100% reliability when it matters most. That\'s the difference between a $50 grocery store bouquet and making your relationship a priority.',
  },
];
