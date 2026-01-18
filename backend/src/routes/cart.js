import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get user's cart
router.get('/', authenticateToken, (req, res) => {
  try {
    const items = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({ items, total });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/', authenticateToken, (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check product exists and has stock
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    const existingItem = db.prepare(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
    ).get(req.user.id, product_id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({ error: 'Not enough stock available' });
      }

      db.prepare(
        'UPDATE cart_items SET quantity = ? WHERE id = ?'
      ).run(newQuantity, existingItem.id);
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({ error: 'Not enough stock available' });
      }

      const id = uuidv4();
      db.prepare(
        'INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)'
      ).run(id, req.user.id, product_id, quantity);
    }

    // Return updated cart
    const items = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({ items, total });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const cartItem = db.prepare(
      'SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?'
    ).get(req.params.id, req.user.id);

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (quantity === 0) {
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(req.params.id);
    } else {
      if (quantity > cartItem.stock) {
        return res.status(400).json({ error: 'Not enough stock available' });
      }
      db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
    }

    // Return updated cart
    const items = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({ items, total });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.user.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Return updated cart
    const items = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({ items, total });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/', authenticateToken, (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    res.json({ items: [], total: 0 });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
