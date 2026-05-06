import { useState, useEffect, useMemo } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Plus, LayoutDashboard, List, PlusCircle, LogOut } from 'lucide-react'
import { supabase, supabaseConfigError } from './supabase'

// ─── Data config ─────────────────────────────────────────────────────────────
const CATEGORIES = {
  'Rent':                { color: '#4d9fff', subs: [] },
  'Groceries & Snacks':  { color: '#00e5a0', subs: ['Stop & Shop', 'Walmart', 'Roxbury Market', 'Wollastons', 'Other'] },
  'Outside Food':        { color: '#ffb340', subs: ['In-person', 'Uber Eats', 'DoorDash'] },
  'Utilities':           { color: '#c97bff', subs: ['Gas Bill', 'Phone EMI', 'Phone Data', 'Electricity'] },
  'Transportation':      { color: '#ff7b5e', subs: ['Cab', 'Train', 'Bus'] },
  'Subscriptions':       { color: '#5eceff', subs: [] },
  'Entertainment':       { color: '#ff5566', subs: [] },
  'Misc':                { color: '#6b6b88', subs: [] },
}
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const fmt = n => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const today = () => new Date().toISOString().slice(0, 10)
const parseDateParts = date => {
  const [year, month, day] = String(date || '').split('-').map(Number)
  return { year, month: month - 1, day }
}
const dateSortValue = date => {
  const { year, month, day } = parseDateParts(date)
  return Date.UTC(year || 0, month || 0, day || 1)
}

function ConfigErrorScreen() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 460, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Setup Required</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>{supabaseConfigError}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginTop: 10 }}>Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart the dev server.</p>
      </div>
    </div>
  )
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  const submit = async () => {
    if (loading) return
    const cleanEmail = email.trim()
    if (!cleanEmail || !password) {
      setError('Email and password are required.')
      return
    }

    setError(''); setMsg(''); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) throw error
        setMsg('Check your email to confirm your account.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
        if (error) throw error
      }
    } catch (e) {
      setError(e.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 380 }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: 'var(--accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#000' }}>FT</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, letterSpacing: '-0.02em' }}>FinTrack</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>Your personal expense ledger</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMsg('') }}
                style={{ flex: 1, padding: '9px', border: 'none', background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? '#000' : 'var(--text-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>
          <div>
            <label style={styles.label}>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label style={styles.label}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 12 }}>{error}</p>}
          {msg   && <p style={{ color: 'var(--accent)', fontSize: 12 }}>{msg}</p>}
          <button className="btn-primary" onClick={submit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a1a24', border: '1px solid #2a2a38', borderRadius: 8, padding: '8px 14px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#e8e8f0' }}>
        {payload[0].name}: <span style={{ color: CATEGORIES[payload[0].name]?.color || '#00e5a0' }}>{fmt(payload[0].value)}</span>
      </p>
    </div>
  )
}

// ─── Expense Modal ────────────────────────────────────────────────────────────
function ExpenseModal({ expense, onClose, onSave }) {
  const isEditing = Boolean(expense)
  const [form, setForm]     = useState({
    date: expense?.date || today(),
    category: expense?.category || 'Groceries & Snacks',
    sub: expense?.sub || '',
    amount: expense?.amount ? String(expense.amount) : '',
    note: expense?.note || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const subs = CATEGORIES[form.category]?.subs || []
  const set  = (k, v) => setForm(f => ({ ...f, [k]: v, ...(k === 'category' ? { sub: '' } : {}) }))

  const submit = async () => {
    if (saving) return
    setError('')
    if (!form.date || !form.category) {
      setError('Date and category are required.')
      return
    }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError('Enter an amount greater than 0.')
      return
    }
    setSaving(true)
    try {
      await onSave({
        date: form.date,
        category: form.category,
        sub: form.sub,
        amount: parseFloat(form.amount),
        note: form.note.trim(),
      })
      onClose()
    } catch (e) {
      setError(e.message || 'Could not save expense.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="fade-in">
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{isEditing ? 'Edit Expense' : 'Log Expense'}</span>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '4px 10px' }}>✕</button>
        </div>
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Amount (USD)</label>
            <input type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>
        </div>
        <div style={styles.grid2}>
          <div>
            <label style={styles.label}>Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}>
              {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {subs.length > 0 && (
            <div>
              <label style={styles.label}>Subcategory</label>
              <select value={form.sub} onChange={e => set('sub', e.target.value)}>
                <option value="">— select —</option>
                {subs.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
        <div>
          <label style={styles.label}>Note (optional)</label>
          <input type="text" placeholder="e.g. Monthly rent" value={form.note} onChange={e => set('note', e.target.value)} />
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={saving}>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Expense'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ expenses }) {
  const now = new Date()
  const [selMonth, setSelMonth] = useState(now.getMonth())
  const [selYear,  setSelYear]  = useState(now.getFullYear())

  const filtered = useMemo(() => expenses.filter(e => {
    const d = parseDateParts(e.date)
    return d.month === selMonth && d.year === selYear
  }), [expenses, selMonth, selYear])

  const total = filtered.reduce((s, e) => s + e.amount, 0)
  const byCategory = useMemo(() => {
    const map = {}
    filtered.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filtered])

  const years = Array.from(new Set([selYear, ...expenses.map(e => parseDateParts(e.date).year).filter(Boolean)])).sort()

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Viewing:</span>
        <select value={selMonth} onChange={e => setSelMonth(+e.target.value)} style={{ width: 'auto', padding: '6px 12px' }}>
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select value={selYear} onChange={e => setSelYear(+e.target.value)} style={{ width: 'auto', padding: '6px 12px' }}>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      <div style={styles.cards}>
        {[
          { label: 'Total Spent',          value: fmt(total),                                        accent: true },
          { label: 'Transactions',          value: filtered.length },
          { label: 'Avg per Transaction',   value: filtered.length ? fmt(total / filtered.length) : '$0.00' },
          { label: 'Top Category',          value: byCategory[0]?.name || '—',                       small: true },
        ].map(c => (
          <div key={c.label} style={styles.card}>
            <span style={styles.cardLabel}>{c.label}</span>
            <span style={{ ...styles.cardValue, ...(c.accent ? { color: 'var(--accent)' } : {}), ...(c.small ? { fontSize: 16 } : {}) }}>{c.value}</span>
          </div>
        ))}
      </div>

      {byCategory.length > 0 ? (
        <>
          <div style={styles.chartsRow}>
            <div style={styles.chartBox}>
              <p style={styles.chartTitle}>Spending by Category</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {byCategory.map(d => <Cell key={d.name} fill={CATEGORIES[d.name]?.color || '#6b6b88'} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center', marginTop: 4 }}>
                {byCategory.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORIES[d.name]?.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.chartBox}>
              <p style={styles.chartTitle}>Amount by Category</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byCategory} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a38" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b6b88', fontSize: 11, fontFamily: 'DM Mono' }} tickFormatter={v => '$' + v} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#9090b0', fontSize: 11, fontFamily: 'DM Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {byCategory.map(d => <Cell key={d.name} fill={CATEGORIES[d.name]?.color || '#6b6b88'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <p style={styles.chartTitle}>Breakdown</p>
            <div style={styles.table}>
              <div style={styles.tableHead}><span>Category</span><span style={{ textAlign: 'right' }}>Amount</span><span style={{ textAlign: 'right' }}>% of total</span></div>
              {byCategory.map(d => (
                <div key={d.name} style={styles.tableRow} className="table-row-hover">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORIES[d.name]?.color, flexShrink: 0 }} />
                    {d.name}
                  </span>
                  <span style={{ textAlign: 'right', color: 'var(--accent)' }}>{fmt(d.value)}</span>
                  <span style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{((d.value / total) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={styles.empty}>
          <span style={{ fontSize: 32 }}>📊</span>
          <p>No expenses for {MONTHS[selMonth]} {selYear}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Hit "Add Expense" to get started</p>
        </div>
      )}
    </div>
  )
}

// ─── Expense List ─────────────────────────────────────────────────────────────
function ExpenseList({ expenses, onEdit, onDelete }) {
  const [filterCat,   setFilterCat]   = useState('All')
  const [filterMonth, setFilterMonth] = useState(-1)
  const [filterYear,  setFilterYear]  = useState(-1)
  const years = Array.from(new Set(expenses.map(e => parseDateParts(e.date).year).filter(Boolean))).sort().reverse()

  const filtered = useMemo(() => expenses
    .filter(e => filterCat === 'All' || e.category === filterCat)
    .filter(e => {
      if (filterMonth === -1 && filterYear === -1) return true
      const d = parseDateParts(e.date)
      if (filterMonth !== -1 && d.month !== filterMonth) return false
      if (filterYear  !== -1 && d.year !== filterYear) return false
      return true
    })
    .sort((a, b) => dateSortValue(b.date) - dateSortValue(a.date))
  , [expenses, filterCat, filterMonth, filterYear])

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: 'auto', padding: '6px 12px' }}>
          <option value="All">All categories</option>
          {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterMonth} onChange={e => setFilterMonth(+e.target.value)} style={{ width: 'auto', padding: '6px 12px' }}>
          <option value={-1}>All months</option>
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(+e.target.value)} style={{ width: 'auto', padding: '6px 12px' }}>
          <option value={-1}>All years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 12, alignSelf: 'center' }}>
          {filtered.length} records · {fmt(filtered.reduce((s, e) => s + e.amount, 0))}
        </span>
      </div>
      {filtered.length === 0 ? (
        <div style={styles.empty}><span style={{ fontSize: 32 }}>🗒️</span><p>No expenses match your filters</p></div>
      ) : (
        <div style={styles.table}>
          <div className="expense-table-head" style={{ ...styles.tableHead, gridTemplateColumns: '100px 1fr 1fr 90px 136px' }}>
            <span>Date</span><span>Category</span><span>Note</span>
            <span style={{ textAlign: 'right' }}>Amount</span><span />
          </div>
          {filtered.map(e => (
            <div key={e.id} style={{ ...styles.tableRow, gridTemplateColumns: '100px 1fr 1fr 90px 136px' }} className="expense-table-row table-row-hover fade-in">
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{e.date}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: CATEGORIES[e.category]?.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13 }}>{e.category}</span>
                </span>
                {e.sub && <span style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 13 }}>{e.sub}</span>}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.note || '—'}</span>
              <span style={{ textAlign: 'right', color: 'var(--accent)', fontSize: 13 }}>{fmt(e.amount)}</span>
              <span style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="btn-ghost btn-compact" onClick={() => onEdit(e)}>Edit</button>
                <button className="btn-danger" onClick={() => onDelete(e.id)}>Delete</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [session,   setSession]   = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [expenses,  setExpenses]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [tab,       setTab]       = useState('dashboard')
  const [editingExpense, setEditingExpense] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const openAddModal = () => {
    setEditingExpense(null)
    setShowModal(true)
  }

  const openEditModal = (expense) => {
    setEditingExpense(expense)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingExpense(null)
  }

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true)
      setLoading(false)
      return undefined
    }

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) throw error
        setSession(session)
      })
      .catch(e => setError(e.message || 'Could not initialize authentication.'))
      .finally(() => setAuthReady(true))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setError('')
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session || !supabase) { setExpenses([]); setLoading(false); return }
    setLoading(true)
    setError('')
    supabase.from('expenses').select('*').order('date', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error
        setExpenses(data || [])
      })
      .catch(e => setError(e.message || 'Could not load expenses.'))
      .finally(() => setLoading(false))
  }, [session])

  const addExpense = async (form) => {
    const { data, error } = await supabase.from('expenses')
      .insert([{ ...form, user_id: session.user.id }])
      .select().single()
    if (error) throw error
    if (!data) throw new Error('Supabase did not return the saved expense.')
    setExpenses(prev => [data, ...prev])
  }

  const updateExpense = async (id, form) => {
    const { data, error } = await supabase.from('expenses')
      .update(form)
      .eq('id', id)
      .select().single()
    if (error) throw error
    if (!data) throw new Error('Supabase did not return the updated expense.')
    setExpenses(prev => prev.map(e => e.id === id ? data : e))
  }

  const deleteExpense = async (id) => {
    const expense = expenses.find(e => e.id === id)
    const label = expense ? `${fmt(expense.amount)} on ${expense.date}` : 'this expense'
    if (!window.confirm(`Delete ${label}?`)) return

    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) {
      setError(error.message || 'Could not delete expense.')
      return
    }
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  if (supabaseConfigError) return <ConfigErrorScreen />
  if (!authReady) return null
  if (!session)   return <AuthScreen />

  return (
    <div style={styles.shell}>
      <aside className="app-sidebar" style={styles.sidebar}>
        <div style={styles.logo}>
          <span style={styles.logoMark}>FT</span>
          <span style={styles.logoText}>FinTrack</span>
        </div>
        <nav style={styles.nav}>
          <button style={{ ...styles.navItem, ...(tab === 'dashboard' ? styles.navActive : {}) }} onClick={() => setTab('dashboard')}>
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button style={{ ...styles.navItem, ...(tab === 'expenses' ? styles.navActive : {}) }} onClick={() => setTab('expenses')}>
            <List size={16} /> Expenses
          </button>
        </nav>
        <button className="btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 16px', justifyContent: 'center' }}>
          <Plus size={15} /> Add Expense
        </button>
        <div style={styles.sidebarFooter}>
          <span style={{ color: 'var(--text-dim)', fontSize: 11, wordBreak: 'break-all' }}>{session.user.email}</span>
          <button className="btn-ghost" onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11 }}>
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </aside>

      <main className="app-main" style={styles.main}>
        <div style={styles.topbar}>
          <h1 style={styles.pageTitle}>{tab === 'dashboard' ? 'Dashboard' : 'All Expenses'}</h1>
          <button className="btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={15} /> Add Expense
          </button>
        </div>
        <div style={styles.content}>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 16 }}>{error}</p>}
          {loading
            ? <div style={styles.empty}><p style={{ color: 'var(--text-muted)' }}>Loading expenses...</p></div>
            : tab === 'dashboard'
              ? <Dashboard expenses={expenses} />
              : <ExpenseList expenses={expenses} onEdit={openEditModal} onDelete={deleteExpense} />
          }
        </div>
      </main>

      <nav className="bottom-nav" style={styles.bottomNav}>
        <button style={{ ...styles.bottomNavItem, ...(tab === 'dashboard' ? styles.bottomNavActive : {}) }} onClick={() => setTab('dashboard')}>
          <LayoutDashboard size={20} /><span>Dashboard</span>
        </button>
        <button style={styles.bottomNavAdd} onClick={openAddModal}>
          <PlusCircle size={28} />
        </button>
        <button style={{ ...styles.bottomNavItem, ...(tab === 'expenses' ? styles.bottomNavActive : {}) }} onClick={() => setTab('expenses')}>
          <List size={20} /><span>Expenses</span>
        </button>
      </nav>

      {showModal && (
        <ExpenseModal
          expense={editingExpense}
          onClose={closeModal}
          onSave={form => editingExpense ? updateExpense(editingExpense.id, form) : addExpense(form)}
        />
      )}
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  shell:           { display: 'flex', minHeight: '100dvh', background: 'var(--bg)' },
  sidebar:         { width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 0 20px', gap: 24, flexShrink: 0 },
  logo:            { display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px' },
  logoMark:        { width: 34, height: 34, background: 'var(--accent)', color: '#000', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', flexShrink: 0 },
  logoText:        { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.02em' },
  nav:             { display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' },
  navItem:         { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: 'none', background: 'transparent', color: 'var(--text-muted)', borderRadius: 'var(--radius)', fontSize: 13, cursor: 'pointer', transition: 'background 0.15s, color 0.15s', textAlign: 'left' },
  navActive:       { background: 'var(--accent-dim)', color: 'var(--accent)' },
  sidebarFooter:   { marginTop: 'auto', padding: '0 20px' },
  main:            { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: 80 },
  topbar:          { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 },
  pageTitle:       { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' },
  content:         { padding: '28px', maxWidth: 1100 },
  cards:           { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 28 },
  card:            { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 },
  cardLabel:       { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' },
  cardValue:       { fontSize: 22, fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--font-display)' },
  chartsRow:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 },
  chartBox:        { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' },
  chartTitle:      { fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 },
  table:           { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  tableHead:       { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', background: 'var(--surface2)' },
  tableRow:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 18px', borderBottom: '1px solid var(--border)', fontSize: 13, alignItems: 'center' },
  empty:           { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '60px 20px', color: 'var(--text-muted)', fontSize: 14 },
  overlay:         { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 },
  modal:           { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 },
  modalHeader:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle:      { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 },
  grid2:           { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label:           { display: 'block', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  bottomNav:       { display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '10px 20px 16px', zIndex: 50, justifyContent: 'space-around', alignItems: 'center' },
  bottomNavItem:   { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', padding: '4px 16px' },
  bottomNavActive: { color: 'var(--accent)' },
  bottomNavAdd:    { background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 4 },
}
