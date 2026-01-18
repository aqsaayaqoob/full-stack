import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Admin.css';

export default function Admin() {
  const { user, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    stock: '',
  });

  useEffect(() => {
    if (token) {
      Promise.all([
        fetch('/api/products?limit=100', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
        fetch('/api/categories', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      ])
        .then(([productsData, categoriesData, ordersData]) => {
          setProducts(productsData.products || []);
          setCategories(categoriesData || []);
          setOrders(ordersData || []);
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-page container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        image_url: product.image_url || '',
        category_id: product.category_id || '',
        stock: product.stock.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', image_url: '', category_id: '', stock: '' });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (editingProduct) {
        setProducts(products.map(p => (p.id === data.id ? data : p)));
      } else {
        setProducts([data, ...products]);
      }
      setShowProductModal(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleStatusChange = async (orderId, status) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const data = await res.json();
      setOrders(orders.map(o => (o.id === data.id ? data : o)));
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'badge-warning',
      processing: 'badge-primary',
      shipped: 'badge-primary',
      delivered: 'badge-success',
      cancelled: 'badge-danger',
    };
    return `badge ${classes[status] || 'badge-primary'}`;
  };

  return (
    <div className="admin-page container">
      <h1>Admin Dashboard</h1>

      <div className="admin-stats">
        <div className="stat-card card">
          <h3>{products.length}</h3>
          <p>Products</p>
        </div>
        <div className="stat-card card">
          <h3>{orders.length}</h3>
          <p>Orders</p>
        </div>
        <div className="stat-card card">
          <h3>{categories.length}</h3>
          <p>Categories</p>
        </div>
        <div className="stat-card card">
          <h3>${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Products</h2>
            <button className="btn btn-primary" onClick={() => openProductModal()}>
              Add Product
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-image">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} />
                        ) : (
                          <span>No Image</span>
                        )}
                      </div>
                    </td>
                    <td>{product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.category_name || '-'}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openProductModal(product)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProduct(product.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="admin-section">
          <h2>Orders</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id.slice(0, 8)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{order.items.length} items</td>
                    <td>${order.total.toFixed(2)}</td>
                    <td>
                      <span className={getStatusBadge(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="input status-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleProductSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    className="input"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    name="stock"
                    className="input"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="image_url"
                  className="input"
                  value={formData.image_url}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category_id"
                  className="input"
                  value={formData.category_id}
                  onChange={handleInputChange}
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
