import type { Event, WasteData, Item, WasteTrend } from '../types/types';

export async function getEvents(): Promise<Event[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Array(6)
    .fill(null)
    .map((_, i) => ({
      id: `event-${i}`,
      title: 'Big cleaning',
      date: '24 Sep 2025',
      time: '11:50 - 17:00',
      location: 'KMUTT',
      status: 'Available' as const,
    }));
}

export async function getWasteData(): Promise<WasteData[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { year: 2016, value: 20 },
    { year: 2017, value: 35 },
    { year: 2018, value: 45 },
    { year: 2019, value: 55 },
    { year: 2020, value: 30 },
    { year: 2021, value: 50 },
    { year: 2022, value: 70 },
    { year: 2023, value: 90 },
  ];
}

export async function getWasteTrends(): Promise<WasteTrend[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { category: 'Plastic', amount: 85000, percentage: 38.6, color: '#3b82f6' },
    { category: 'Paper', amount: 52000, percentage: 23.6, color: '#10b981' },
    { category: 'Organic', amount: 43000, percentage: 19.5, color: '#f59e0b' },
    { category: 'Metal', amount: 25000, percentage: 11.4, color: '#6366f1' },
    { category: 'Glass', amount: 15000, percentage: 6.8, color: '#ec4899' },
  ];
}

export async function getItems(): Promise<Item[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const categories = ['Books', 'Furniture', 'Electronics', 'Clothing', 'Toys'];
  const conditions = ['Like New', 'Good', 'Fair'];
  return Array(12)
    .fill(null)
    .map((_, i) => ({
      id: `item-${i}`,
      name: [
        'Books Collection',
        'Desk Lamp',
        'Office Chair',
        'Winter Jacket',
        'Toy Set',
        'Bookshelf',
        'Laptop Stand',
        'Backpack',
      ][i % 8],
      description: 'Gently used item in good condition, free for pickup.',
      category: categories[i % categories.length],
      condition: conditions[i % conditions.length],
      image: `https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop&q=80&${i}`,
      postedBy: `User ${i + 1}`,
      postedDate: '2 days ago',
    }));
}
