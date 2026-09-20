import { useState, useMemo } from 'react';
import { Wallet, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { Expense } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES, formatCurrency, currencySymbol, currencyInputPadding } from '../data';

interface Props {
  expenses: Expense[];
  budget: number;
  income: number;
  currency: string;
  onBudgetChange: (b: number) => void;
  onIncomeChange: (i: number) => void;
}

function fmt(n: number, currency: string) {
  return formatCurrency(n, currency, true);
}

export default function MonthlyBudget({ expenses, budget, income, currency, onBudgetChange, onIncomeChange }: Props) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [newBudget, setNewBudget] = useState(budget.toString());
  const [newIncome, setNewIncome] = useState(income.toString());
  const [saved, setSaved] = useState(false);

  const thisMonthExp = useMemo(() =>
    expenses.filter(e => e.date.startsWith(thisMonth)), [expenses, thisMonth]);
  const totalSpent = useMemo(() =>
    thisMonthExp.reduce((s, e) => s + e.amount, 0), [thisMonthExp]);

  const pct = Math.min((totalSpent / budget) * 100, 100);
  const remaining = budget - totalSpent;
  const savingsRate = income > 0 ? ((income - totalSpent) / income) * 100 : 0;

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthExp.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return CATEGORIES
      .map(c => ({ name: c, value: map[c] || 0 }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [thisMonthExp]);

  const handleSave = () => {
    const b = parseFloat(newBudget);
    const i = parseFloat(newIncome);
    if (!isNaN(b) && b > 0) onBudgetChange(b);
    if (!isNaN(i) && i > 0) onIncomeChange(i);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const status = pct >= 100 ? 'exceeded' : pct >= 85 ? 'warning' : pct >= 60 ? 'caution' : 'healthy';
  const statusColors = {
    exceeded: { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', icon: <AlertTriangle size={16} /> },
    warning: { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', icon: <AlertTriangle size={16} /> },
    caution: { bg: '#FFF7ED', border: '#FED7AA', color: '#EA580C', icon: <TrendingDown size={16} /> },
    healthy: { bg: '#D1FAE5', border: '#6EE7B7', color: '#059669', icon: <CheckCircle size={16} /> },
  };
  const statusMessages = {
    exceeded: `Budget exceeded by ${fmt(totalSpent - budget, currency)}. Consider reviewing your expenses.`,
    warning: `You've used ${pct.toFixed(0)}% of your budget. Only ${fmt(remaining, currency)} left this month.`,
    caution: `Spending is on track. ${fmt(remaining, currency)} remaining for the rest of the month.`,
    healthy: `Great job! You're well within budget with ${fmt(remaining, currency)} to spare.`,
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* Status banner */}
      <div className="rounded-xl px-4 py-3.5 flex items-center gap-3"
        style={{ background: statusColors[status].bg, border: `1px solid ${statusColors[status].border}` }}>
        <span style={{ color: statusColors[status].color }}>{statusColors[status].icon}</span>
        <p className="text-sm font-medium" style={{ color: statusColors[status].color }}>
          {statusMessages[status]}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Budget overview */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#EDE9FE' }}>
              <Wallet size={18} style={{ color: '#7C3AED' }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Monthly Overview</h2>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Big progress bar */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: '#6B7280' }}>Total Spent</span>
              <span className="font-semibold font-mono-data" style={{ color: '#1A1028' }}>
                {fmt(totalSpent, currency)} / {fmt(budget, currency)}
              </span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: '#EDE9FE' }}>
              <div className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                style={{
                  width: `${pct}%`,
                  minWidth: pct > 0 ? '2rem' : 0,
                  background: pct >= 100 ? '#EF4444' : pct >= 85 ? '#F59E0B' : 'linear-gradient(90deg, #7C3AED, #8B5CF6)',
                }}>
                {pct > 15 && (
                  <span className="text-xs font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {pct.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs mt-1.5" style={{ color: '#9CA3AF' }}>
              <span>{currencySymbol(currency)}0</span>
              <span>{fmt(budget, currency)}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Income', value: fmt(income, currency), color: '#10B981', bg: '#D1FAE5' },
              { label: 'Spent', value: fmt(totalSpent, currency), color: '#EF4444', bg: '#FEE2E2' },
              { label: remaining >= 0 ? 'Remaining' : 'Over Budget', value: fmt(Math.abs(remaining), currency), color: remaining >= 0 ? '#7C3AED' : '#EF4444', bg: remaining >= 0 ? '#EDE9FE' : '#FEE2E2' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: s.bg }}>
                <p className="text-xs font-medium mb-1" style={{ color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.label}</p>
                <p className="text-base font-bold font-mono-data" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Savings rate */}
          <div className="mt-4 p-3 rounded-xl" style={{ background: '#F8F7FF' }}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span style={{ color: '#6B7280' }}>Savings Rate</span>
              <span className="font-semibold" style={{ color: savingsRate >= 20 ? '#059669' : '#D97706' }}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 rounded-full" style={{ background: '#E5E0F8' }}>
              <div className="h-full rounded-full" style={{
                width: `${Math.max(0, Math.min(savingsRate, 100))}%`,
                background: savingsRate >= 20 ? '#10B981' : '#F59E0B'
              }} />
            </div>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
              {savingsRate >= 20 ? '👍 Above 20% target' : `${(20 - savingsRate).toFixed(1)}% below 20% target`}
            </p>
          </div>
        </div>

        {/* Edit budget */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Adjust Budget & Income</h3>

          {saved && (
            <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#D1FAE5' }}>
              <CheckCircle size={13} style={{ color: '#059669' }} />
              <span className="text-xs font-medium" style={{ color: '#065F46' }}>Saved!</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>
                Monthly Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                  style={{ color: '#7C3AED', pointerEvents: 'none', whiteSpace: 'nowrap' }}>{currencySymbol(currency)}</span>
                <input type="number" min="0" step="0.01" value={newBudget}
                  onChange={e => setNewBudget(e.target.value)}
                  className="w-full pr-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#F9F8FF', border: '1.5px solid #E5E0F8', color: '#1A1028', paddingLeft: currencyInputPadding(currency) }}
                  onFocus={e => { e.target.style.border = '1.5px solid #7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                  onBlur={e => { e.target.style.border = '1.5px solid #E5E0F8'; e.target.style.boxShadow = ''; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>
                Monthly Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
                  style={{ color: '#10B981', pointerEvents: 'none', whiteSpace: 'nowrap' }}>{currencySymbol(currency)}</span>
                <input type="number" min="0" step="0.01" value={newIncome}
                  onChange={e => setNewIncome(e.target.value)}
                  className="w-full pr-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#F9F8FF', border: '1.5px solid #E5E0F8', color: '#1A1028', paddingLeft: currencyInputPadding(currency) }}
                  onFocus={e => { e.target.style.border = '1.5px solid #7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                  onBlur={e => { e.target.style.border = '1.5px solid #E5E0F8'; e.target.style.boxShadow = ''; }}
                />
              </div>
            </div>

            <button onClick={handleSave}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: '#7C3AED', fontFamily: 'Outfit, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}>
              Save Changes
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-4">
            <p className="text-xs font-semibold mb-2" style={{ color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>QUICK PRESETS</p>
            <div className="grid grid-cols-2 gap-2">
              {[1000, 1500, 2000, 3000].map(b => (
                <button key={b} onClick={() => setNewBudget(b.toString())}
                  className="py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: newBudget === b.toString() ? '#EDE9FE' : '#F9F8FF',
                    border: `1px solid ${newBudget === b.toString() ? '#7C3AED' : '#E5E0F8'}`,
                    color: newBudget === b.toString() ? '#7C3AED' : '#6B7280',
                    fontFamily: 'Outfit, sans-serif',
                  }}>
                  {currencySymbol(currency)}{b.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category budget breakdown */}
      <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Spending by Category</h3>
        {categoryTotals.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: '#9CA3AF' }}>No expenses this month</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {categoryTotals.map(cat => {
              const catPct = budget > 0 ? (cat.value / budget) * 100 : 0;
              const ofTotal = totalSpent > 0 ? (cat.value / totalSpent) * 100 : 0;
              return (
                <div key={cat.name} className="p-3.5 rounded-xl" style={{ background: '#F8F7FF', border: '1px solid #E5E0F8' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#1A1028', fontFamily: 'Outfit, sans-serif' }}>
                      {CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]} {cat.name}
                    </span>
                    <span className="text-sm font-semibold font-mono-data" style={{ color: CATEGORY_COLORS[cat.name as keyof typeof CATEGORY_COLORS] }}>
                      {fmt(cat.value, currency)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full mb-1.5" style={{ background: '#E5E0F8' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.min(catPct, 100)}%`,
                      background: CATEGORY_COLORS[cat.name as keyof typeof CATEGORY_COLORS],
                    }} />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: '#9CA3AF' }}>
                    <span>{catPct.toFixed(1)}% of budget</span>
                    <span>{ofTotal.toFixed(1)}% of spending</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}