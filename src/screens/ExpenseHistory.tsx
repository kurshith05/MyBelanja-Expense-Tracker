import { useState, useMemo } from 'react';
import { Search, Filter, Pencil, Trash2, ChevronDown } from 'lucide-react';
import { Expense, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, PAYMENT_METHODS, formatCurrency } from '../data';

interface Props {
  expenses: Expense[];
  currency: string;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

function fmt(n: number, currency: string) {
  return formatCurrency(n, currency, true);
}

export default function ExpenseHistory({ expenses, currency, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | ''>('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const months = useMemo(() => {
    const set = new Set(expenses.map(e => e.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [expenses]);

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.amount.toString().includes(q);
      const matchCat = !filterCategory || e.category === filterCategory;
      const matchMonth = !filterMonth || e.date.startsWith(filterMonth);
      const matchPayment = !filterPayment || e.paymentMethod === filterPayment;
      return matchSearch && matchCat && matchMonth && matchPayment;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, search, filterCategory, filterMonth, filterPayment]);

  const total = useMemo(() => filtered.reduce((s, e) => s + e.amount, 0), [filtered]);

  const clearFilters = () => {
    setSearch(''); setFilterCategory(''); setFilterMonth(''); setFilterPayment('');
  };

  const hasFilters = search || filterCategory || filterMonth || filterPayment;

  return (
    <div className="max-w-5xl space-y-4">
      {/* Search + filter bar */}
      <div className="rounded-2xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
            <input
              type="text" placeholder="Search transactions..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#F9F8FF', border: '1.5px solid #E5E0F8', color: '#1A1028' }}
              onFocus={e => { e.target.style.border = '1.5px solid #7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
              onBlur={e => { e.target.style.border = '1.5px solid #E5E0F8'; e.target.style.boxShadow = ''; }}
            />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: showFilters || hasFilters ? '#EDE9FE' : '#F9F8FF',
              border: `1.5px solid ${showFilters || hasFilters ? '#7C3AED' : '#E5E0F8'}`,
              color: showFilters || hasFilters ? '#7C3AED' : '#6B7280',
              fontFamily: 'Outfit, sans-serif',
            }}>
            <Filter size={14} /> Filters {hasFilters ? '·' : ''} <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid sm:grid-cols-3 gap-3 mt-3 pt-3" style={{ borderTop: '1px solid #E5E0F8' }}>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as Category | '')}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: '#F9F8FF', border: '1.5px solid #E5E0F8', color: '#1A1028' }}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
            </select>

            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: '#F9F8FF', border: '1.5px solid #E5E0F8', color: '#1A1028' }}>
              <option value="">All Months</option>
              {months.map(m => {
                const [y, mo] = m.split('-');
                const label = new Date(parseInt(y), parseInt(mo) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
                return <option key={m} value={m}>{label}</option>;
              })}
            </select>

            <select value={filterPayment} onChange={e => setFilterPayment(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: '#F9F8FF', border: '1.5px solid #E5E0F8', color: '#1A1028' }}>
              <option value="">All Payment Methods</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm" style={{ color: '#6B7280' }}>
          <strong style={{ color: '#1A1028' }}>{filtered.length}</strong> transaction{filtered.length !== 1 ? 's' : ''}
          {hasFilters && <button onClick={clearFilters} className="ml-2 text-xs underline" style={{ color: '#7C3AED' }}>Clear filters</button>}
        </p>
        <p className="text-sm font-semibold font-mono-data" style={{ color: '#EF4444' }}>
          Total: {fmt(total, currency)}
        </p>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-medium" style={{ color: '#6B7280' }}>No transactions found</p>
            {hasFilters && <button onClick={clearFilters} className="mt-2 text-xs" style={{ color: '#7C3AED' }}>Clear filters</button>}
          </div>
        ) : (
          <>
            {/* Table header - hidden on mobile */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold"
              style={{ borderBottom: '1px solid #E5E0F8', color: '#9CA3AF', fontFamily: 'Outfit, sans-serif', background: '#FAFAFA' }}>
              <span className="col-span-1">Date</span>
              <span className="col-span-4">Description</span>
              <span className="col-span-2">Category</span>
              <span className="col-span-2">Payment</span>
              <span className="col-span-2 text-right">Amount</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>

            <div className="divide-y" style={{ borderColor: '#F3F0FF' }}>
              {filtered.map(exp => (
                <div key={exp.id}
                  className="px-5 py-3.5 hover:bg-purple-50/30 transition-colors"
                  style={{ '--tw-bg-opacity': 0.3 } as React.CSSProperties}>
                  {/* Mobile layout */}
                  <div className="md:hidden flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm"
                      style={{ background: CATEGORY_COLORS[exp.category] + '15' }}>
                      {CATEGORY_ICONS[exp.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate" style={{ color: '#1A1028' }}>{exp.description}</p>
                        <span className="text-sm font-semibold font-mono-data shrink-0" style={{ color: '#EF4444' }}>
                          -{fmt(exp.amount, currency)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>
                          {new Date(exp.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: CATEGORY_COLORS[exp.category] + '15', color: CATEGORY_COLORS[exp.category] }}>
                          {exp.category}
                        </span>
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>{exp.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => onEdit(exp)} className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: '#EDE9FE' }}>
                        <Pencil size={12} style={{ color: '#7C3AED' }} />
                      </button>
                      <button onClick={() => setDeleteConfirm(exp.id)} className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: '#FEE2E2' }}>
                        <Trash2 size={12} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                    <span className="col-span-1 text-xs font-mono-data" style={{ color: '#9CA3AF' }}>
                      {new Date(exp.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="col-span-4 flex items-center gap-2.5">
                      <span className="text-base">{CATEGORY_ICONS[exp.category]}</span>
                      <span className="text-sm truncate" style={{ color: '#1A1028' }}>{exp.description}</span>
                    </div>
                    <span className="col-span-2">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: CATEGORY_COLORS[exp.category] + '15', color: CATEGORY_COLORS[exp.category] }}>
                        {exp.category}
                      </span>
                    </span>
                    <span className="col-span-2 text-xs" style={{ color: '#9CA3AF' }}>{exp.paymentMethod}</span>
                    <span className="col-span-2 text-right text-sm font-semibold font-mono-data" style={{ color: '#EF4444' }}>
                      -{fmt(exp.amount, currency)}
                    </span>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button onClick={() => onEdit(exp)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: '#F5F3FF' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#EDE9FE')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#F5F3FF')}>
                        <Pencil size={12} style={{ color: '#7C3AED' }} />
                      </button>
                      <button onClick={() => setDeleteConfirm(exp.id)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                        style={{ background: '#FFF5F5' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#FFF5F5')}>
                        <Trash2 size={12} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,16,40,0.5)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(124,58,237,0.2)' }}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FEE2E2' }}>
                <Trash2 size={20} style={{ color: '#EF4444' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Delete Expense?</h3>
              <p className="text-sm mb-5" style={{ color: '#6B7280' }}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#F3F4F6', color: '#6B7280', fontFamily: 'Outfit, sans-serif' }}>
                  Cancel
                </button>
                <button onClick={() => { onDelete(deleteConfirm); setDeleteConfirm(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#EF4444', fontFamily: 'Outfit, sans-serif' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
