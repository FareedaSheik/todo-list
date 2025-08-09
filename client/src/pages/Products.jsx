import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ name: '', sku: '', price: '', stock: '' })
  const [savingId, setSavingId] = useState(null)

  const load = async () => setProducts(await getProducts())
  useEffect(() => { load() }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) }
    if (!payload.name || !payload.sku) return
    await createProduct(payload)
    setForm({ name: '', sku: '', price: '', stock: '' })
    await load()
  }

  const onUpdate = async (id, patch) => {
    setSavingId(id)
    await updateProduct(id, patch)
    setSavingId(null)
    await load()
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await deleteProduct(id)
    await load()
  }

  return (
    <div className="page">
      <h3>Products</h3>
      <form onSubmit={onCreate} className="card">
        <div className="row">
          <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
        </div>
        <div className="row">
          <input placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
        </div>
        <button type="submit">Add Product</button>
      </form>

      <div className="list">
        {products.map(p => (
          <div className="card" key={p.id}>
            <div className="row">
              <b>{p.name}</b> <span>SKU: {p.sku}</span>
            </div>
            <div className="row">
              <span>Price: ${p.price.toFixed(2)}</span>
              <span>Stock: {p.stock}</span>
            </div>
            <div className="row">
              <button disabled={savingId===p.id} onClick={() => onUpdate(p.id, { stock: p.stock + 1 })}>+1 stock</button>
              <button disabled={savingId===p.id || p.stock===0} onClick={() => onUpdate(p.id, { stock: Math.max(0, p.stock - 1) })}>-1 stock</button>
              <button className="danger" onClick={() => onDelete(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}