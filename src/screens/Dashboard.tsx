import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Expense, Screen } from '../types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORIES, formatCurrency, formatCompact } from '../data';

interface Props {
  expenses: Expense[];
  budget: number;
  income: number;
  currency: string;
  onNavigate: (s: Screen) => void;
}

function fmt(n: number, currency: string) {
  return formatCurrency(n, currency, false);
}

function StatCard({ label, value, sub, icon, color, trend }: {
  label: string; value: string; sub?: string; icon: React.ReactNode;
  color: string; trend?: 'up' | 'down' | null;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
          <span style={{ color }}>{icon}</span>
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: trend === 'up' ? '#D1FAE5' : '#FEE2E2', color: trend === 'up' ? '#059669' : '#DC2626' }}>
            {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend === 'up' ? '+2.4%' : '-1.8%'}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>{value}</p>
      <p className="text-xs font-medium" style={{ color: '#6B7280' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard({ expenses, budget, income, currency, onNavigate }: Props) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const thisMonthExp = useMemo(() =>
    expenses.filter(e => e.date.startsWith(thisMonth)), [expenses, thisMonth]);
  const lastMonthExp = useMemo(() =>
    expenses.filter(e => e.date.startsWith(lastMonth)), [expenses, lastMonth]);

  const totalSpent = useMemo(() => thisMonthExp.reduce((s, e) => s + e.amount, 0), [thisMonthExp]);
  const lastMonthTotal = useMemo(() => lastMonthExp.reduce((s, e) => s + e.amount, 0), [lastMonthExp]);
  const remaining = budget - totalSpent;
  const balance = income - totalSpent;
  const pct = Math.min((totalSpent / budget) * 100, 100);

  // Category totals for pie
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthExp.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return CATEGORIES
      .map(c => ({ name: c, value: map[c] || 0, color: CATEGORY_COLORS[c] }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [thisMonthExp]);

  // Daily spending for area chart
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    thisMonthExp.forEach(e => {
      const day = e.date.split('-')[2];
      days[day] = (days[day] || 0) + e.amount;
    });
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: Math.min(now.getDate(), daysInMonth) }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      return { day: String(i + 1), amount: days[day] || 0 };
    });
  }, [thisMonthExp]);

  const recent = useMemo(() =>
    [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [expenses]);

  const topCategories = categoryTotals.slice(0, 4);

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Budget alert */}
      {pct >= 85 && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: pct >= 100 ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${pct >= 100 ? '#FECACA' : '#FDE68A'}` }}>
          <span className="text-base">{pct >= 100 ? '🚨' : '⚠️'}</span>
          <p className="text-sm font-medium" style={{ color: pct >= 100 ? '#DC2626' : '#D97706' }}>
            {pct >= 100
              ? `You've exceeded your monthly budget by ${fmt(totalSpent - budget, currency)}!`
              : `You've used ${pct.toFixed(0)}% of your monthly budget — only ${fmt(remaining, currency)} left.`}
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Income" value={fmt(income, currency)} icon={<TrendingUp size={18} />} color="#10B981" trend="up" />
        <StatCard label="Total Spent" value={fmt(totalSpent, currency)}
          sub={`vs ${fmt(lastMonthTotal, currency)} last month`}
          icon={<TrendingDown size={18} />} color="#EF4444" trend="down" />
        <StatCard label="Remaining Budget" value={fmt(Math.max(remaining, 0), currency)}
          sub={`${pct.toFixed(0)}% of ${fmt(budget, currency)} used`}
          icon={<Wallet size={18} />} color="#7C3AED" />
        <StatCard label="Net Balance" value={fmt(balance, currency)}
          icon={<DollarSign size={18} />} color="#3B82F6" trend={balance > 0 ? 'up' : 'down'} />
      </div>

      {/* Budget progress + chart */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Budget bar */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Budget Progress</h3>
          <div className="flex justify-between text-xs mb-2" style={{ color: '#6B7280' }}>
            <span>Spent: <strong style={{ color: '#1A1028' }}>{fmt(totalSpent, currency)}</strong></span>
            <span>Budget: <strong style={{ color: '#1A1028' }}>{fmt(budget, currency)}</strong></span>
          </div>
          <div className="h-3 rounded-full overflow-hidden mb-3" style={{ background: '#EDE9FE' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 100 ? '#EF4444' : pct >= 85 ? '#F59E0B' : '#7C3AED'
              }} />
          </div>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            {remaining >= 0 ? `${fmt(remaining, currency)} remaining` : `${fmt(-remaining, currency)} over budget`}
          </p>

          {/* Category bars */}
          <div className="mt-5 space-y-3">
            {topCategories.map(cat => {
              const catPct = totalSpent > 0 ? (cat.value / totalSpent) * 100 : 0;
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: '#6B7280' }}>{CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS]} {cat.name}</span>
                    <span className="font-mono-data font-medium" style={{ color: '#1A1028', fontSize: '11px' }}>
                      {fmt(cat.value, currency)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#F3F4F6' }}>
                    <div className="h-full rounded-full" style={{ width: `${catPct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spending chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Daily Spending</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                tickFormatter={v => formatCompact(v, currency)} width={40} />
              <Tooltip
                contentStyle={{ background: '#1A1028', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }}
                formatter={(v: number) => [fmt(v, currency), 'Spent']}
                labelFormatter={l => `Day ${l}`}
              />
              <Area type="monotone" dataKey="amount" stroke="#7C3AED" strokeWidth={2}
                fill="url(#spendGrad)" dot={false} activeDot={{ r: 4, fill: '#7C3AED' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Spending by Category</h3>
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>No expenses this month</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryTotals} cx="40%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="value" paddingAngle={2}>
                  {categoryTotals.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 11, color: '#6B7280' }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: '#1A1028', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }}
                  formatter={(v: number) => [fmt(v, currency), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent transactions */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Recent Transactions</h3>
            <button onClick={() => onNavigate('expense-history')}
              className="text-xs flex items-center gap-1 font-medium" style={{ color: '#7C3AED' }}>
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recent.map(exp => (
              <div key={exp.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
                  style={{ background: CATEGORY_COLORS[exp.category] + '15' }}>
                  {CATEGORY_ICONS[exp.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#1A1028' }}>{exp.description}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    {exp.category} · {new Date(exp.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className="text-sm font-semibold font-mono-data shrink-0" style={{ color: '#EF4444' }}>
                  -{fmt(exp.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
