import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './OrderDetail.css';

export default function OrderDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Order not found');
          return res.json();
        })
        .then(setOrder)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, token]);

  if (!user) {
    return (
      <div className="order-detail container">
        <div className="not-found">
          <h2>Please Log In</h2>
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
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

  if (error || !order) {
    return (
      <div className="order-detail container">
        <div className="not-found">
          <h2>Order Not Found</h2>
          <Link to="/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

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
    <div className="order-detail container">
      <Link to="/orders" className="back-link">← Back to Orders</Link>

      <div className="order-detail-header">
        <div>
          <h1>Order #{order.id.slice(0, 8)}</h1>
          <p className="order-date">
            Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span className={getStatusBadge(order.status)}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="order-detail-grid">
        <div className="order-items-section card">
          <h2>Order Items</h2>
          <div className="order-items-list">
            {order.items.map(item => (
              <div key={item.id} className="order-item">
                <div className="order-item-image">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="order-item-info">
                  <Link to={`/products/${item.product_id}`} className="order-item-name">
                    {item.name}
                  </Link>
                  <p className="order-item-price">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <div className="order-item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-sidebar">
          <div className="card order-summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="card shipping-card">
            <h2>Shipping Address</h2>
            <p className="shipping-address">{order.shipping_address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
