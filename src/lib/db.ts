import { supabase } from './supabaseClient';
import { Expense, Budget, Income, UserProfile } from '../types';
import { DEFAULT_CURRENCY } from '../data';

// ---------- Expenses ----------

export async function fetchExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, amount, category, date, description, payment_method')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(row => ({
    id: row.id,
    amount: Number(row.amount),
    category: row.category,
    date: row.date,
    description: row.description ?? '',
    paymentMethod: row.payment_method,
  }));
}

export async function insertExpense(userId: string, expense: Omit<Expense, 'id'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      payment_method: expense.paymentMethod,
    })
    .select('id, amount, category, date, description, payment_method')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    amount: Number(data.amount),
    category: data.category,
    date: data.date,
    description: data.description ?? '',
    paymentMethod: data.payment_method,
  };
}

export async function updateExpenseRow(userId: string, expense: Expense): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .update({
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      description: expense.description,
      payment_method: expense.paymentMethod,
    })
    .eq('id', expense.id)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function deleteExpenseRow(userId: string, id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function clearAllExpenses(userId: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('user_id', userId);
  if (error) throw error;
}

// ---------- Profile (also holds budget + income) ----------

interface ProfileRow {
  id: string;
  name: string;
  currency: string;
  avatar: string | null;
  monthly_budget: number;
  monthly_income: number;
}

export interface FullProfile {
  profile: UserProfile;
  budget: Budget;
  income: Income;
}

export async function fetchProfile(userId: string, fallbackEmail: string): Promise<FullProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, currency, avatar, monthly_budget, monthly_income')
    .eq('id', userId)
    .single();

  // PGRST116 = no row found (shouldn't normally happen, the signup trigger creates one)
  if (error && error.code === 'PGRST116') {
    const created = await createDefaultProfile(userId, fallbackEmail);
    return created;
  }
  if (error) throw error;

  const row = data as ProfileRow;
  return {
    profile: { name: row.name, email: fallbackEmail, currency: row.currency, avatar: row.avatar ?? '' },
    budget: { monthly: Number(row.monthly_budget) },
    income: { monthly: Number(row.monthly_income) },
  };
}

async function createDefaultProfile(userId: string, email: string): Promise<FullProfile> {
  const defaultName = email.split('@')[0];
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    name: defaultName,
    currency: DEFAULT_CURRENCY,
    avatar: '',
    monthly_budget: 0,
    monthly_income: 0,
  });
  if (error) throw error;
  return {
    profile: { name: defaultName, email, currency: DEFAULT_CURRENCY, avatar: '' },
    budget: { monthly: 0 },
    income: { monthly: 0 },
  };
}

export async function saveProfileRow(userId: string, profile: UserProfile): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ name: profile.name, currency: profile.currency, avatar: profile.avatar })
    .eq('id', userId);
  if (error) throw error;
}

export async function saveBudgetRow(userId: string, monthly: number): Promise<void> {
  const { error } = await supabase.from('profiles').update({ monthly_budget: monthly }).eq('id', userId);
  if (error) throw error;
}

export async function saveIncomeRow(userId: string, monthly: number): Promise<void> {
  const { error } = await supabase.from('profiles').update({ monthly_income: monthly }).eq('id', userId);
  if (error) throw error;
}
