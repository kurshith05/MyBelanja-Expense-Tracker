export type Category =
  | 'Food'
  | 'Transportation'
  | 'Bills'
  | 'Shopping'
  | 'Education'
  | 'Entertainment'
  | 'Health'
  | 'Other';

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Digital Wallet';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO date string
  description: string;
  paymentMethod: PaymentMethod;
}

export interface Budget {
  monthly: number;
}

export interface Income {
  monthly: number;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  avatar: string;
}

export type Screen =
  | 'dashboard'
  | 'add-expense'
  | 'expense-history'
  | 'monthly-budget'
  | 'categories'
  | 'monthly-reports'
  | 'settings';
