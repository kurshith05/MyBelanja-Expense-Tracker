import { useState } from 'react';
import { User, Globe, Bell, Shield, Trash2, CheckCircle, LogOut } from 'lucide-react';
import { UserProfile } from '../types';
import { CURRENCIES } from '../data';

interface Props {
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  onClearData: () => void;
  onSignOut: () => void;
}

const inputStyle = {
  background: '#F9F8FF',
  border: '1.5px solid #E5E0F8',
  color: '#1A1028',
};

/**
 * NOTE: Section and Toggle are defined at module scope on purpose.
 * When they lived inside Settings(), every keystroke produced a brand new
 * component type, so React unmounted and remounted the whole subtree and the
 * focused input lost focus after each character typed or deleted.
 */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '1px solid #E5E0F8', boxShadow: '0 1px 4px rgba(124,58,237,0.06)' }}>
      <div className="flex items-center gap-2.5 mb-4 pb-4" style={{ borderBottom: '1px solid #E5E0F8' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EDE9FE' }}>
          <span style={{ color: '#7C3AED' }}>{icon}</span>
        </div>
        <h3 className="text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label, sub }: { checked: boolean; onChange: () => void; label: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-medium" style={{ color: '#1A1028' }}>{label}</p>
        {sub && <p className="text-xs" style={{ color: '#9CA3AF' }}>{sub}</p>}
      </div>
      <button onClick={onChange}
        className="relative rounded-full transition-all duration-200 shrink-0"
        style={{ background: checked ? '#7C3AED' : '#D1D5DB', width: '40px', height: '22px' }}>
        <span className="absolute top-0.5 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ width: '18px', height: '18px', left: checked ? '20px' : '2px' }} />
      </button>
    </div>
  );
}

export default function Settings({ profile, onSave, onClearData, onSignOut }: Props) {
  const [form, setForm] = useState({ ...profile });
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklyReport: false,
    monthlyReport: true,
  });

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = (form.name || form.email || '?')
    .split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl space-y-5">
      {saved && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
          <CheckCircle size={16} style={{ color: '#059669' }} />
          <p className="text-sm font-medium" style={{ color: '#065F46' }}>Settings saved successfully!</p>
        </div>
      )}

      {/* Profile */}
      <Section icon={<User size={14} />} title="Profile">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', fontFamily: 'Outfit, sans-serif' }}>
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#1A1028', fontFamily: 'Outfit, sans-serif' }}>{form.name}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>{form.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>Full Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}
              placeholder="Your name"
              autoComplete="name"
              onFocus={e => { e.target.style.border = '1.5px solid #7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
              onBlur={e => { e.target.style.border = '1.5px solid #E5E0F8'; e.target.style.boxShadow = ''; }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>Email Address</label>
            <input type="email" value={form.email} disabled
              className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-not-allowed"
              style={{ ...inputStyle, opacity: 0.6 }}
            />
            <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>This is your sign-in email and can't be changed here.</p>
          </div>
        </div>
      </Section>

      {/* Preferences */}
      <Section icon={<Globe size={14} />} title="Preferences">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151', fontFamily: 'Outfit, sans-serif' }}>Currency</label>
          <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={inputStyle}
            onFocus={e => { e.target.style.border = '1.5px solid #7C3AED'; }}
            onBlur={e => { e.target.style.border = '1.5px solid #E5E0F8'; }}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
          <p className="text-xs mt-1.5" style={{ color: '#9CA3AF' }}>Every amount in the app is shown in this currency.</p>
        </div>
      </Section>

      {/* Notifications */}
      <Section icon={<Bell size={14} />} title="Notifications">
        <div className="space-y-0 divide-y" style={{ borderColor: '#F3F0FF' }}>
          <Toggle
            checked={notifications.budgetAlerts}
            onChange={() => setNotifications(n => ({ ...n, budgetAlerts: !n.budgetAlerts }))}
            label="Budget Alerts"
            sub="Get notified when spending approaches your limit"
          />
          <Toggle
            checked={notifications.weeklyReport}
            onChange={() => setNotifications(n => ({ ...n, weeklyReport: !n.weeklyReport }))}
            label="Weekly Summary"
            sub="Receive a weekly spending summary"
          />
          <Toggle
            checked={notifications.monthlyReport}
            onChange={() => setNotifications(n => ({ ...n, monthlyReport: !n.monthlyReport }))}
            label="Monthly Report"
            sub="Get your full monthly report at month end"
          />
        </div>
      </Section>

      <button onClick={handleSave}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
        style={{ background: '#7C3AED', fontFamily: 'Outfit, sans-serif' }}
        onMouseEnter={e => (e.currentTarget.style.background = '#6D28D9')}
        onMouseLeave={e => (e.currentTarget.style.background = '#7C3AED')}>
        Save Settings
      </button>

      {/* Danger zone */}
      <Section icon={<Shield size={14} />} title="Data Management">
        <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
          Manage your app data. These actions cannot be undone.
        </p>
        <button onClick={() => setConfirmClear(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', fontFamily: 'Outfit, sans-serif' }}>
          <Trash2 size={14} />
          Clear All Expense Data
        </button>
      </Section>

      {/* Account */}
      <Section icon={<LogOut size={14} />} title="Account">
        <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
          Sign out of MyBelanja on this device.
        </p>
        <button onClick={onSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', fontFamily: 'Outfit, sans-serif' }}>
          <LogOut size={14} />
          Sign Out
        </button>
      </Section>

      {/* Confirm modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(26,16,40,0.5)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: '#FFFFFF', boxShadow: '0 20px 60px rgba(124,58,237,0.2)' }}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FEE2E2' }}>
                <Trash2 size={20} style={{ color: '#EF4444' }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif', color: '#1A1028' }}>Clear All Data?</h3>
              <p className="text-sm mb-5" style={{ color: '#6B7280' }}>
                This will permanently delete all your expense records. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmClear(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#F3F4F6', color: '#6B7280', fontFamily: 'Outfit, sans-serif' }}>
                  Cancel
                </button>
                <button onClick={() => { onClearData(); setConfirmClear(false); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#EF4444', fontFamily: 'Outfit, sans-serif' }}>
                  Clear Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
