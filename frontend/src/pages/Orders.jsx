import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

export default function Orders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (!user) {
    return (
      <div className="orders-page container">
        <div className="empty-orders">
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your orders.</p>
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
    <div className="orders-page container">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-card card">
              <div className="order-header">
                <div>
                  <span className="order-id">Order #{order.id.slice(0, 8)}</span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={getStatusBadge(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map(item => (
                  <div key={item.id} className="order-item-preview">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="order-item-more">
                    +{order.items.length - 3} more
                  </div>
                )}
              </div>

              <div className="order-footer">
                <span className="order-total">${order.total.toFixed(2)}</span>
                <span className="view-details">View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
