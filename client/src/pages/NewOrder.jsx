import { useEffect, useMemo, useState } from 'react'
import { getProducts, getCustomers, createOrder } from '../api'

export default function NewOrder() {
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [selections, setSelections] = useState({}) // productId -> qty
  const [customerId, setCustomerId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    (async () => {
      setProducts(await getProducts())
      setCustomers(await getCustomers())
    })()
  }, [])

  const items = useMemo(() => Object.entries(selections)
    .filter(([, qty]) => Number(qty) > 0)
    .map(([pid, qty]) => ({ productId: Number(pid), quantity: Number(qty) })), [selections])

  const total = useMemo(() => items.reduce((sum, it) => {
    const p = products.find(pp => pp.id === it.productId)
    return sum + (p ? p.price * it.quantity : 0)
  }, 0), [items, products])

  const submit = async (e) => {
    e.preventDefault()
    if (items.length === 0) return setMessage('Select at least one product')
    setSubmitting(true)
    setMessage('')
    try {
      await createOrder({ customerId: customerId ? Number(customerId) : undefined, items })
      setSelections({})
      setCustomerId('')
      setMessage('Order created')
    } catch (e) {
      setMessage(e?.response?.data?.error || 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h3>New Order</h3>
      <form onSubmit={submit} className="card">
        <div className="row">
          <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
            <option value="">Walk-in (no customer)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="list">
          {products.map(p => (
            <div className="row" key={p.id}>
              <span style={{minWidth: 200}}>{p.name} (${p.price.toFixed(2)}) — Stock: {p.stock}</span>
              <input
                type="number"
                min="0"
                max={p.stock}
                value={selections[p.id] ?? ''}
                onChange={e => setSelections({ ...selections, [p.id]: e.target.value })}
                placeholder="Qty"
                style={{width: 80}}
              />
            </div>
          ))}
        </div>

        <div className="row">
          <b>Total: ${total.toFixed(2)}</b>
        </div>
        <button disabled={submitting} type="submit">Create Order</button>
        {message && <p>{message}</p>}
      </form>
    </div>
  )
}