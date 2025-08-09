import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import Products from './pages/Products.jsx'
import Customers from './pages/Customers.jsx'
import Orders from './pages/Orders.jsx'
import NewOrder from './pages/NewOrder.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <nav className="nav">
          <h2>Chicken Shop Management</h2>
          <div className="links">
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/customers">Customers</NavLink>
            <NavLink to="/orders">Orders</NavLink>
            <NavLink to="/orders/new">New Order</NavLink>
          </div>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/new" element={<NewOrder />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
