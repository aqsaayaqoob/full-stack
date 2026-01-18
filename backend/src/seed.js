import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './db/database.js';

async function seed() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminId = uuidv4();

  try {
    db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(adminId, 'admin@example.com', adminPassword, 'Admin User', 'admin');
    console.log('Created admin user: admin@example.com / admin123');
  } catch (e) {
    console.log('Admin user already exists');
  }

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customerId = uuidv4();

  try {
    db.prepare(`
      INSERT INTO users (id, email, password, name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(customerId, 'customer@example.com', customerPassword, 'Test Customer', 'customer');
    console.log('Created customer user: customer@example.com / customer123');
  } catch (e) {
    console.log('Customer user already exists');
  }

  // Create categories
  const categories = [
    { id: uuidv4(), name: 'Electronics', description: 'Electronic devices and gadgets' },
    { id: uuidv4(), name: 'Clothing', description: 'Apparel and fashion items' },
    { id: uuidv4(), name: 'Books', description: 'Books and educational materials' },
    { id: uuidv4(), name: 'Home & Garden', description: 'Home decor and garden supplies' },
  ];

  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (id, name, description) VALUES (?, ?, ?)');
  for (const cat of categories) {
    insertCategory.run(cat.id, cat.name, cat.description);
  }
  console.log('Created categories');

  // Get category IDs
  const electronicsId = db.prepare("SELECT id FROM categories WHERE name = 'Electronics'").get()?.id;
  const clothingId = db.prepare("SELECT id FROM categories WHERE name = 'Clothing'").get()?.id;
  const booksId = db.prepare("SELECT id FROM categories WHERE name = 'Books'").get()?.id;
  const homeId = db.prepare("SELECT id FROM categories WHERE name = 'Home & Garden'").get()?.id;

  // Create products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'High-quality Bluetooth headphones with noise cancellation',
      price: 149.99,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category_id: electronicsId,
      stock: 50,
    },
    {
      name: 'Smartphone',
      description: 'Latest model smartphone with advanced features',
      price: 799.99,
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      category_id: electronicsId,
      stock: 30,
    },
    {
      name: 'Laptop',
      description: 'Powerful laptop for work and gaming',
      price: 1299.99,
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      category_id: electronicsId,
      stock: 20,
    },
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt',
      price: 24.99,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      category_id: clothingId,
      stock: 100,
    },
    {
      name: 'Denim Jeans',
      description: 'Classic fit denim jeans',
      price: 59.99,
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      category_id: clothingId,
      stock: 75,
    },
    {
      name: 'Running Shoes',
      description: 'Lightweight running shoes with cushioning',
      price: 89.99,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      category_id: clothingId,
      stock: 40,
    },
    {
      name: 'JavaScript: The Good Parts',
      description: 'Essential guide to JavaScript programming',
      price: 29.99,
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      category_id: booksId,
      stock: 60,
    },
    {
      name: 'Clean Code',
      description: 'A handbook of agile software craftsmanship',
      price: 39.99,
      image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      category_id: booksId,
      stock: 45,
    },
    {
      name: 'Indoor Plant Set',
      description: 'Set of 3 beautiful indoor plants',
      price: 49.99,
      image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400',
      category_id: homeId,
      stock: 25,
    },
    {
      name: 'Desk Lamp',
      description: 'Modern LED desk lamp with adjustable brightness',
      price: 34.99,
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
      category_id: homeId,
      stock: 35,
    },
  ];

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products (id, name, description, price, image_url, category_id, stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const product of products) {
    insertProduct.run(
      uuidv4(),
      product.name,
      product.description,
      product.price,
      product.image_url,
      product.category_id,
      product.stock
    );
  }
  console.log('Created products');

  console.log('Database seeded successfully!');
}

seed().catch(console.error);
