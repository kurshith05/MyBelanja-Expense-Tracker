import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { Expense } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, formatCurrency, formatCompact } from '../data';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

interface Props {
  expenses: Expense[];
  currency: string;
  budget: number;
}

function fmt(n: number, currency: string) {
  return formatCurrency(n, currency, false);
}

export default function MonthlyReports({ expenses, currency, budget }: Props) {
  const now = new Date();

  // Last 6 months
  const months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short' });
      const total = expenses
        .filter(e => e.date.startsWith(key))
        .reduce((s, e) => s + e.amount, 0);
      return { key, label, total, budget };
    });
  }, [expenses, budget]);

  const thisMonth = months[5];
  const lastMonth = months[4];
  const trend = lastMonth.total > 0
    ? ((thisMonth.total - lastMonth.total) / lastMonth.total) * 100
    : 0;

  const thisMonthExp = useMemo(() =>
    expenses.filter(e => e.date.startsWith(thisMonth.key)), [expenses, thisMonth.key]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    thisMonthExp.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return CATEGORIES.map(c => ({
      name: c, value: map[c] || 0,
      color: CATEGORY_COLORS[c],
      icon: CATEGORY_ICONS[c],
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);
  }, [thisMonthExp]);

  const topCategory = categoryBreakdown[0];

  // Monthly comparison line chart data
  const lineData = useMemo(() => {
    return months.map(m => {
      const obj: Record<string, number | string> = { month: m.label };
      CATEGORIES.forEach(c => {
        obj[c] = expenses
          .filter(e => e.date.startsWith(m.key) && e.category === c)
          .reduce((s, e) => s + e.amount, 0);
      });
      return obj;
    });
  }, [months, expenses]);

  const avg = months.reduce((s, m) => s + m.total, 0) / months.length;

  return (
    <div className="max-w-5xl space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'This Month',
            value: fmt(thisMonth.total, currency),
            icon: <TrendingDown size={18} />,
            color: '#EF4444', bg: '#FEE2E2',
            sub: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}% vs last month`,
          },
          {
            label: 'Last Month',
            value: fmt(lastMonth.total, currency),
            icon: <TrendingUp size={18} />,
            color: '#7C3AED', bg: '#EDE9FE',
            sub: '',
          },
          {
            label: '6-Month Average',
            value: fmt(avg, currency),
            icon: <TrendingUp size={18} />,
            color: '#3B82F6', bg: '#DBEAFE',
            sub: '',
          },
          {
            label: 'Top Category',
            value: topCategory?.name ?? 'None',
            icon: <Award size={18} />,
            color: '#F59E0B', bg: '#FEF3C7',
            sub: topCategory ? fmt(topCategory.value, currency) : '',
          },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <p className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>{s.label}</p>
            {s.sub && <p className="text-xs mt-0.5 font-medium" style={{ color: trend > 0 ? '#EF4444' : '#10B981' }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Monthly trend bar chart */}
      <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>6-Month Spending Trend</h3>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Monthly totals vs budget</p>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#9CA3AF' }}>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#7C3AED' }} /> Spent</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1 inline-block rounded-full" style={{ background: '#E5E0F8' }} /> Budget</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={months} barCategoryGap="30%">
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
              tickFormatter={v => formatCompact(v, currency)} width={45} />
            <CartesianGrid vertical={false} stroke="#F3F0FF" strokeDasharray="3 0" />
            <Tooltip
              contentStyle={{ background: '#1A1028', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }}
              formatter={(v: number, name: string) => [fmt(v, currency), name === 'total' ? 'Spent' : 'Budget']}
            />
            <Bar dataKey="budget" fill="#EDE9FE" radius={[4, 4, 0, 0]} name="Budget" />
            <Bar dataKey="total" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown + line chart */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* This month categories */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>
            {now.toLocaleString('default', { month: 'long' })} by Category
          </h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat, i) => {
                const pct = thisMonth.total > 0 ? (cat.value / thisMonth.total) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cat.icon}</span>
                        <span className="text-sm font-medium" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>{cat.name}</span>
                        {i === 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: '#FEF3C7', color: '#D97706' }}>Top</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold font-mono-data" style={{ color: cat.color }}>{fmt(cat.value, currency)}</p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{pct.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: '#E5E0F8' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cat.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category trend line */}
        <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Category Trends</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={lineData}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                tickFormatter={v => v > 0 ? formatCompact(v, currency) : ''} width={40} />
              <CartesianGrid vertical={false} stroke="#F3F0FF" />
              <Tooltip
                contentStyle={{ background: '#1A1028', border: 'none', borderRadius: 8, color: '#fff', fontSize: 10 }}
                formatter={(v: number, name: string) => [fmt(v, currency), name]}
              />
              {categoryBreakdown.slice(0, 4).map(cat => (
                <Line key={cat.name} type="monotone" dataKey={cat.name}
                  stroke={cat.color} strokeWidth={2} dot={false}
                  activeDot={{ r: 3, fill: cat.color }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          {/* Mini legend */}
          <div className="flex flex-wrap gap-3 mt-2">
            {categoryBreakdown.slice(0, 4).map(cat => (
              <span key={cat.name} className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: cat.color, display: 'inline-block' }} />
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Month comparison table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
        <div className="px-5 py-4" style={{ background: '#FAFAFA', borderBottom: '1px solid #E5E0F8' }}>
          <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Month-over-Month Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E0F8' }}>
                <th className="text-left px-5 py-3 text-xs font-semibold" style={{ color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>Month</th>
                <th className="text-right px-5 py-3 text-xs font-semibold" style={{ color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>Total Spent</th>
                <th className="text-right px-5 py-3 text-xs font-semibold" style={{ color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>Budget</th>
                <th className="text-right px-5 py-3 text-xs font-semibold" style={{ color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>Variance</th>
                <th className="text-right px-5 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>vs Prev</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#F3F0FF' }}>
              {[...months].reverse().map((m, i, arr) => {
                const variance = budget - m.total;
                const prevTotal = arr[i + 1]?.total;
                const prevChange = prevTotal != null && prevTotal > 0
                  ? ((m.total - prevTotal) / prevTotal) * 100 : null;
                return (
                  <tr key={m.key} className="hover:bg-purple-50/20 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: '#1A1028', fontFamily: 'Outfit, sans-serif' }}>
                      {new Date(m.key + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                      {i === 0 && <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#EDE9FE', color: '#7C3AED' }}>Current</span>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-mono-data font-medium" style={{ color: '#1A1028' }}>
                      {fmt(m.total, currency)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-mono-data" style={{ color: '#9CA3AF' }}>
                      {fmt(budget, currency)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-right font-mono-data font-medium"
                      style={{ color: variance >= 0 ? '#059669' : '#DC2626' }}>
                      {variance >= 0 ? '+' : ''}{fmt(variance, currency)}
                    </td>
                    <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                      {prevChange != null ? (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: prevChange > 0 ? '#FEE2E2' : '#D1FAE5',
                            color: prevChange > 0 ? '#DC2626' : '#059669',
                          }}>
                          {prevChange > 0 ? '+' : ''}{prevChange.toFixed(1)}%
                        </span>
                      ) : <span className="text-xs" style={{ color: '#D1D5DB' }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
