import { useEffect, useState } from 'react'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({ name: '', phone: '' })

  const load = async () => setCustomers(await getCustomers())
  useEffect(() => { load() }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    if (!form.name) return
    await createCustomer({ name: form.name, phone: form.phone || undefined })
    setForm({ name: '', phone: '' })
    await load()
  }

  const onUpdate = async (id, patch) => {
    await updateCustomer(id, patch)
    await load()
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    await deleteCustomer(id)
    await load()
  }

  return (
    <div className="page">
      <h3>Customers</h3>
      <form onSubmit={onCreate} className="card">
        <div className="row">
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <button type="submit">Add Customer</button>
      </form>

      <div className="list">
        {customers.map(c => (
          <div className="card" key={c.id}>
            <div className="row"><b>{c.name}</b><span>{c.phone || '-'}</span></div>
            <div className="row">
              <button onClick={() => onUpdate(c.id, { name: prompt('New name', c.name) || c.name })}>Rename</button>
              <button onClick={() => onUpdate(c.id, { phone: prompt('New phone', c.phone || '') || null })}>Edit Phone</button>
              <button className="danger" onClick={() => onDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}