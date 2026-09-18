import { useState } from 'react';
import { CheckCircle, PlusCircle } from 'lucide-react';
import { Expense, Category, PaymentMethod } from '../types';
import { CATEGORIES, PAYMENT_METHODS, CATEGORY_ICONS, CATEGORY_COLORS, currencySymbol, currencyInputPadding } from '../data';

interface Props {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  currency: string;
  editingExpense?: Expense | null;
  onUpdate?: (expense: Expense) => void;
  onCancelEdit?: () => void;
}

export default function AddExpense({ onAdd, currency, editingExpense, onUpdate, onCancelEdit }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const isEditing = !!editingExpense;

  const [form, setForm] = useState({
    amount: editingExpense?.amount.toString() ?? '',
    category: editingExpense?.category ?? '' as Category | '',
    date: editingExpense?.date ?? today,
    description: editingExpense?.description ?? '',
    paymentMethod: editingExpense?.paymentMethod ?? '' as PaymentMethod | '',
  });

  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Enter a valid amount greater than 0';
    if (!form.category) errs.category = 'Select a category';
    if (!form.date) errs.date = 'Select a date';
    if (!form.description.trim()) errs.description = 'Add a description';
    if (!form.paymentMethod) errs.paymentMethod = 'Select a payment method';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const data = {
      amount: parseFloat(form.amount),
      category: form.category as Category,
      date: form.date,
      description: form.description.trim(),
      paymentMethod: form.paymentMethod as PaymentMethod,
    };

    if (isEditing && editingExpense && onUpdate) {
      onUpdate({ ...editingExpense, ...data });
      onCancelEdit?.();
    } else {
      onAdd(data);
      setSaved(true);
      setForm({ amount: '', category: '', date: today, description: '', paymentMethod: '' });
      setTimeout(() => setSaved(false), 3000);
    }
    setErrors({});
  };

  const field = (label: string, name: string, children: React.ReactNode, error?: string) => (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  );

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-150";
  const inputStyle = (name: string) => ({
    background: '#F9F8FF',
    border: `1.5px solid ${errors[name] ? '#FCA5A5' : '#E5E0F8'}`,
    color: '#1A1028',
    fontFamily: 'Inter, sans-serif',
  });
  const focusStyle = { border: '1.5px solid #7C3AED', boxShadow: '0 0 0 3px rgba(124,58,237,0.12)' };

  return (
    <div className="max-w-2xl">
      {saved && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
          <CheckCircle size={16} style={{ color: '#059669' }} />
          <p className="text-sm font-medium" style={{ color: '#065F46' }}>Expense saved successfully!</p>
        </div>
      )}

      <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#EDE9FE' }}>
            <PlusCircle size={18} style={{ color: '#7C3AED' }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>
              {isEditing ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {isEditing ? 'Update the expense details below' : 'Record your spending in seconds'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          {field('Amount', 'amount',
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold"
                style={{ color: '#7C3AED', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                {currencySymbol(currency)}
              </span>
              <input
                type="number" step="0.01" min="0" placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className={inputClass}
                style={{ ...inputStyle('amount'), paddingLeft: currencyInputPadding(currency, 0.875) }}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.boxShadow = ''; e.target.style.border = `1.5px solid ${errors.amount ? '#FCA5A5' : '#E5E0F8'}`; }}
              />
            </div>,
            errors.amount
          )}

          {/* Category */}
          {field('Category', 'category',
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => {
                const active = form.category === cat;
                return (
                  <button key={cat} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat }))}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium transition-all duration-150"
                    style={{
                      background: active ? CATEGORY_COLORS[cat] + '15' : '#F9F8FF',
                      border: `1.5px solid ${active ? CATEGORY_COLORS[cat] : '#E5E0F8'}`,
                      color: active ? CATEGORY_COLORS[cat] : '#6B7280',
                    }}>
                    <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '10px' }}>{cat}</span>
                  </button>
                );
              })}
            </div>,
            errors.category
          )}

          {/* Date + Payment */}
          <div className="grid sm:grid-cols-2 gap-4">
            {field('Date', 'date',
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                max={today}
                className={inputClass} style={inputStyle('date')}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.boxShadow = ''; e.target.style.border = `1.5px solid ${errors.date ? '#FCA5A5' : '#E5E0F8'}`; }}
              />,
              errors.date
            )}

            {field('Payment Method', 'paymentMethod',
              <select value={form.paymentMethod}
                onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}
                className={inputClass} style={inputStyle('paymentMethod')}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.boxShadow = ''; e.target.style.border = `1.5px solid ${errors.paymentMethod ? '#FCA5A5' : '#E5E0F8'}`; }}>
                <option value="">Select method</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>,
              errors.paymentMethod
            )}
          </div>

          {/* Description */}
          {field('Description / Notes', 'description',
            <textarea rows={3} placeholder="What did you spend on?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={inputClass} style={{ ...inputStyle('description'), resize: 'none' }}
              onFocus={e => Object.assign(e.target.style, focusStyle)}
              onBlur={e => { e.target.style.boxShadow = ''; e.target.style.border = `1.5px solid ${errors.description ? '#FCA5A5' : '#E5E0F8'}`; }}
            />,
            errors.description
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit"
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150 flex items-center justify-center gap-2"
              style={{ background: '#7C3AED', fontFamily: 'Outfit, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
              onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}>
              <PlusCircle size={16} />
              {isEditing ? 'Update Expense' : 'Save Expense'}
            </button>
            {isEditing && (
              <button type="button" onClick={onCancelEdit}
                className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                style={{ background: '#F3F4F6', color: '#6B7280', fontFamily: 'Outfit, sans-serif' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
