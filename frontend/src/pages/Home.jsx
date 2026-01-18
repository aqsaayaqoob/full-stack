import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=8').then(res => res.json()),
      fetch('/api/categories').then(res => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData.products || []);
        setCategories(categoriesData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Welcome to ShopEase</h1>
          <p>Discover amazing products at great prices</p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="categories-section container">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="category-card card"
            >
              <h3>{category.name}</h3>
              <p>{category.product_count} products</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section container">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/products">View All</Link>
        </div>
        <div className="grid grid-cols-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
