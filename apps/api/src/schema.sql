CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash TEXT,
  role VARCHAR DEFAULT 'customer',
  encrypted_phone TEXT,
  encrypted_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR UNIQUE,
  name TEXT,
  shade_name TEXT,
  hex_code VARCHAR(7),
  price NUMERIC(10,2),
  stock_quantity INT,
  image_url TEXT,
  finish TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total_amount NUMERIC(10,2),
  status VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  quantity INT,
  price_at_purchase NUMERIC(10,2)
);
