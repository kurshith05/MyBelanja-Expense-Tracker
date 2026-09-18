import { useMemo } from 'react';
import { Expense } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, formatCurrency } from '../data';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  expenses: Expense[];
  currency: string;
}

function fmt(n: number, currency: string) {
  return formatCurrency(n, currency, false);
}

export default function Categories({ expenses, currency }: Props) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const thisMonthExp = useMemo(() => expenses.filter(e => e.date.startsWith(thisMonth)), [expenses, thisMonth]);
  const lastMonthExp = useMemo(() => expenses.filter(e => e.date.startsWith(lastMonth)), [expenses, lastMonth]);

  const totalSpent = useMemo(() => thisMonthExp.reduce((s, e) => s + e.amount, 0), [thisMonthExp]);

  const categoryData = useMemo(() => {
    const thisMap: Record<string, number> = {};
    const lastMap: Record<string, number> = {};
    thisMonthExp.forEach(e => { thisMap[e.category] = (thisMap[e.category] || 0) + e.amount; });
    lastMonthExp.forEach(e => { lastMap[e.category] = (lastMap[e.category] || 0) + e.amount; });
    return CATEGORIES.map(c => ({
      name: c,
      thisMonth: thisMap[c] || 0,
      lastMonth: lastMap[c] || 0,
      count: thisMonthExp.filter(e => e.category === c).length,
      color: CATEGORY_COLORS[c],
      icon: CATEGORY_ICONS[c],
      pct: totalSpent > 0 ? ((thisMap[c] || 0) / totalSpent) * 100 : 0,
    })).sort((a, b) => b.thisMonth - a.thisMonth);
  }, [thisMonthExp, lastMonthExp, totalSpent]);

  const radialData = categoryData
    .filter(c => c.thisMonth > 0)
    .map(c => ({ name: c.name, value: Math.round(c.pct), fill: c.color }));

  const topCategory = categoryData[0];

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent', value: fmt(totalSpent, currency), color: '#7C3AED', bg: '#EDE9FE' },
          { label: 'Categories Used', value: `${categoryData.filter(c => c.thisMonth > 0).length}`, color: '#3B82F6', bg: '#DBEAFE' },
          { label: 'Top Category', value: topCategory?.thisMonth > 0 ? topCategory.name : 'None', color: '#10B981', bg: '#D1FAE5' },
          { label: 'Avg per Category', value: totalSpent > 0 ? fmt(totalSpent / Math.max(categoryData.filter(c => c.thisMonth > 0).length, 1), currency) : fmt(0, currency), color: '#F59E0B', bg: '#FEF3C7' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: s.bg }}>
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            </div>
            <p className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Radial chart */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <h3 className="text-sm font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Distribution</h3>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Spending share by category</p>
          {radialData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm" style={{ color: '#9CA3AF' }}>No data this month</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%"
                data={radialData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={4} label={false} />
                <Tooltip
                  contentStyle={{ background: '#1A1028', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }}
                  formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1.5 mt-2">
            {radialData.slice(0, 5).map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                <span className="text-xs flex-1" style={{ color: '#6B7280' }}>{d.name}</span>
                <span className="text-xs font-medium font-mono-data" style={{ color: '#1A1028' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category cards */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #E5E0F8', background: '#FAFAFA' }}>
            <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>All Categories</h3>
          </div>
          <div className="divide-y" style={{ borderColor: '#F3F0FF' }}>
            {CATEGORIES.map(cat => {
              const data = categoryData.find(c => c.name === cat)!;
              const trend = data.lastMonth > 0
                ? ((data.thisMonth - data.lastMonth) / data.lastMonth) * 100
                : data.thisMonth > 0 ? 100 : 0;
              return (
                <div key={cat} className="px-5 py-4 hover:bg-purple-50/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                      style={{ background: CATEGORY_COLORS[cat] + '15' }}>
                      {CATEGORY_ICONS[cat]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold" style={{ color: '#1A1028', fontFamily: 'Outfit, sans-serif' }}>{cat}</span>
                        <div className="flex items-center gap-3">
                          {data.lastMonth > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{
                                background: trend > 0 ? '#FEE2E2' : trend < 0 ? '#D1FAE5' : '#F3F4F6',
                                color: trend > 0 ? '#DC2626' : trend < 0 ? '#059669' : '#6B7280',
                              }}>
                              {trend > 0 ? '+' : ''}{trend.toFixed(0)}%
                            </span>
                          )}
                          <span className="text-sm font-semibold font-mono-data" style={{ color: data.thisMonth > 0 ? CATEGORY_COLORS[cat] : '#D1D5DB' }}>
                            {fmt(data.thisMonth, currency)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full mb-1" style={{ background: '#E5E0F8' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${data.pct}%`, background: CATEGORY_COLORS[cat] }} />
                      </div>
                      <div className="flex justify-between text-xs" style={{ color: '#9CA3AF' }}>
                        <span>{data.count} transaction{data.count !== 1 ? 's' : ''}</span>
                        <span>{data.pct.toFixed(1)}% of total</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
