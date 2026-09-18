import { useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Auth from './screens/Auth';
import Dashboard from './screens/Dashboard';
import AddExpense from './screens/AddExpense';
import ExpenseHistory from './screens/ExpenseHistory';
import MonthlyBudget from './screens/MonthlyBudget';
import Categories from './screens/Categories';
import MonthlyReports from './screens/MonthlyReports';
import Settings from './screens/Settings';
import { useAuth } from './lib/auth';
import {
  fetchExpenses, insertExpense, updateExpenseRow, deleteExpenseRow, clearAllExpenses,
  fetchProfile, saveProfileRow, saveBudgetRow, saveIncomeRow,
} from './lib/db';
import { Expense, Screen, UserProfile } from './types';
import { DEFAULT_CURRENCY } from './data';

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F7FF' }}>
      <Loader2 size={28} className="animate-spin" style={{ color: '#7C3AED' }} />
    </div>
  );
}

export default function App() {
  const { session, user, loading: authLoading, signOut } = useAuth();

  const [screen, setScreen] = useState<Screen>('dashboard');
  const [dataLoading, setDataLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState(0);
  const [income, setIncome] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '', currency: DEFAULT_CURRENCY, avatar: '' });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Load this user's data fresh whenever they sign in; reset to a clean slate on sign out.
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setBudget(0);
      setIncome(0);
      setProfile({ name: '', email: '', currency: DEFAULT_CURRENCY, avatar: '' });
      setScreen('dashboard');
      setDataLoading(false);
      return;
    }

    let cancelled = false;
    setDataLoading(true);

    (async () => {
      const [expensesData, profileData] = await Promise.all([
        fetchExpenses(user.id),
        fetchProfile(user.id, user.email ?? ''),
      ]);
      if (cancelled) return;
      setExpenses(expensesData);
      setProfile(profileData.profile);
      setBudget(profileData.budget.monthly);
      setIncome(profileData.income.monthly);
      setDataLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  const addExpense = useCallback(async (data: Omit<Expense, 'id'>) => {
    if (!user) return;
    const created = await insertExpense(user.id, data);
    setExpenses(prev => [created, ...prev]);
  }, [user]);

  const updateExpense = useCallback(async (updated: Expense) => {
    if (!user) return;
    await updateExpenseRow(user.id, updated);
    setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditingExpense(null);
    setScreen('expense-history');
  }, [user]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!user) return;
    await deleteExpenseRow(user.id, id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, [user]);

  const handleBudgetChange = useCallback(async (b: number) => {
    if (!user) return;
    setBudget(b);
    await saveBudgetRow(user.id, b);
  }, [user]);

  const handleIncomeChange = useCallback(async (i: number) => {
    if (!user) return;
    setIncome(i);
    await saveIncomeRow(user.id, i);
  }, [user]);

  const handleProfileSave = useCallback(async (p: UserProfile) => {
    if (!user) return;
    setProfile(p);
    await saveProfileRow(user.id, p);
  }, [user]);

  const handleClearData = useCallback(async () => {
    if (!user) return;
    await clearAllExpenses(user.id);
    setExpenses([]);
  }, [user]);

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setScreen('add-expense');
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingExpense(null);
    setScreen('expense-history');
  }, []);

  if (authLoading) return <FullScreenLoader />;
  if (!session) return <Auth />;
  if (dataLoading) return <FullScreenLoader />;

  const currency = profile.currency;

  return (
    <Layout
      current={screen}
      onNavigate={s => { setScreen(s); if (s !== 'add-expense') setEditingExpense(null); }}
      profile={profile}
      onSignOut={signOut}
    >
      {screen === 'dashboard' && (
        <Dashboard
          expenses={expenses}
          budget={budget}
          income={income}
          currency={currency}
          onNavigate={setScreen}
        />
      )}
      {screen === 'add-expense' && (
        <AddExpense
          onAdd={addExpense}
          currency={currency}
          editingExpense={editingExpense}
          onUpdate={updateExpense}
          onCancelEdit={handleCancelEdit}
        />
      )}
      {screen === 'expense-history' && (
        <ExpenseHistory
          expenses={expenses}
          currency={currency}
          onEdit={handleEdit}
          onDelete={deleteExpense}
        />
      )}
      {screen === 'monthly-budget' && (
        <MonthlyBudget
          expenses={expenses}
          budget={budget}
          income={income}
          currency={currency}
          onBudgetChange={handleBudgetChange}
          onIncomeChange={handleIncomeChange}
        />
      )}
      {screen === 'categories' && (
        <Categories expenses={expenses} currency={currency} />
      )}
      {screen === 'monthly-reports' && (
        <MonthlyReports expenses={expenses} currency={currency} budget={budget} />
      )}
      {screen === 'settings' && (
        <Settings
          profile={profile}
          onSave={handleProfileSave}
          onClearData={handleClearData}
          onSignOut={signOut}
        />
      )}
    </Layout>
  );
}
