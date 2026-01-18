import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage('Please log in first');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    setLoading(true);
    try {
      await addToCart(product.id);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.message);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card card">
      <div className="product-image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} />
        ) : (
          <div className="no-image">No Image</div>
        )}
        {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.category_name && (
          <span className="product-category">{product.category_name}</span>
        )}
        <p className="product-price">${product.price.toFixed(2)}</p>
        <button
          className="btn btn-primary add-to-cart"
          onClick={handleAddToCart}
          disabled={loading || product.stock === 0}
        >
          {loading ? 'Adding...' : 'Add to Cart'}
        </button>
        {message && <span className="cart-message">{message}</span>}
      </div>
    </Link>
  );
}
