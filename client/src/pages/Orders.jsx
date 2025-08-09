import { useEffect, useState } from 'react'
import { getOrders } from '../api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const load = async () => setOrders(await getOrders())
  useEffect(() => { load() }, [])

  return (
    <div className="page">
      <h3>Orders</h3>
      <div className="list">
        {orders.map(o => (
          <div className="card" key={o.id}>
            <div className="row">
              <b>Order #{o.id}</b>
              <span>Total: ${o.total.toFixed(2)}</span>
            </div>
            <div className="row"><span>Customer ID: {o.customerId || 'Walk-in'}</span></div>
            <ul>
              {o.items.map(it => (
                <li key={it.id}>Product {it.productId} x {it.quantity} @ ${it.price.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}