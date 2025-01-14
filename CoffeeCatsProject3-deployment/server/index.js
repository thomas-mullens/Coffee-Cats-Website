// server/index.js
const express = require('express');
const app = express();
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const { auth } = require('express-openid-connect');

if (!process.env.AUTH0_SECRET || !process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET) {
  console.error('Missing required AUTH0 environment variables');
  process.exit(1);
}

// Configure CORS
app.use(cors({
  origin: 'https://coffeecatsproject3-1-gb0y.onrender.com', // Allow front-end origin
  credentials: true
}));
app.use(express.json());

// Database configuration
const pool = new Pool({
  user: "coffee_cats_01",
  host: "csce-315-db.engr.tamu.edu",
  database: "CSCE315Database",
  password: "coffee",
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: "https://coffeecatsproject3-0okd.onrender.com",
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: "https://dev-bamiuzipt0rllkoo.us.auth0.com",
  routes: {
    callback: "/callback"
  },
  session: {
    absoluteDuration: 24 * 60 * 60,
    cookie: {
      secure: true,
      sameSite: 'None'
    }
  },
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  }
};

console.log('AUTH0_SECRET:', process.env.AUTH0_SECRET);
console.log('AUTH0_CLIENT_ID:', process.env.AUTH0_CLIENT_ID); // Added log for verification

// Use Auth0 authentication middleware
app.use(auth(config));

app.get('/', (req, res) => {
  res.redirect('https://coffeecatsproject3-1-gb0y.onrender.com');
});

// Login route
app.get('/login', (req, res) => {
  return res.oidc.login({
    returnTo: 'https://coffeecatsproject3-1-gb0y.onrender.com',
    authorizationParams: {
      redirect_uri: `${config.baseURL}/callback`
    }
  });
});

// Callback route
app.get('/callback', async (req, res) => {
  try {
    // Let the middleware handle the callback
    await req.oidc.callback();
    return res.redirect('https://coffeecatsproject3-1-gb0y.onrender.com');
  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect('https://coffeecatsproject3-1-gb0y.onrender.com/error');
  }
});

// Update the logout route to handle the redirect properly
app.get('/logout', (req, res) => {
  // First log out of Auth0
  res.oidc.logout({
    returnTo: 'https://coffeecatsproject3-1-gb0y.onrender.com',
    // Make sure this matches what's configured in Auth0 dashboard
    logoutParams: {
      returnTo: 'https://coffeecatsproject3-1-gb0y.onrender.com'
    }
  });
});

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

const PASSWORD = 'admin123'; // This should be in an environment variable in production

// Modify the auth status endpoint to be simpler
app.get('/auth-status', (req, res) => {
  res.json({
    isAuthenticated: req.oidc.isAuthenticated(),
    userProfile: req.oidc.isAuthenticated() ? {
      email: req.oidc.user.email,
      name: req.oidc.user.name,
      picture: req.oidc.user.picture
    } : null
  });
});

// Add a new endpoint to validate manager password
app.post('/api/validate-manager', requireAuth, (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});


// Get all menu items
app.get('/api/menu-items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY category, name');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get or create employee
    let employeeResult = await client.query('SELECT id FROM employees LIMIT 1');
    
    if (employeeResult.rows.length === 0) {
      employeeResult = await client.query(
        'INSERT INTO employees (name) VALUES ($1) RETURNING id',
        ['Default Employee']
      );
    }
    
    const employeeId = employeeResult.rows[0].id;

    const orderResult = await client.query(
      'INSERT INTO orders (employee_id, order_time, isactive) VALUES ($1, NOW(), true) RETURNING id',
      [employeeId]
    );
    const orderId = orderResult.rows[0].id;

    // Add order items
    for (const item of req.body.items) {
      await client.query(
        'INSERT INTO order_items (order_id, menu_item, quantity) VALUES ($1, $2, $3)',
        [orderId, item.name, item.quantity]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order submission error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      WITH OrdersWithItems AS (
        SELECT 
          o.*,
          e.name as employee_name,
          json_agg(json_build_object('menu_item', oi.menu_item, 'quantity', oi.quantity)) as items
        FROM orders o 
        LEFT JOIN employees e ON o.employee_id = e.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id, e.name, o.isactive
      )
      (
        -- Get all active orders
        SELECT * FROM OrdersWithItems 
        WHERE isactive = true
        ORDER BY order_time DESC
      )
      UNION ALL
      (
        -- Get only last 10 completed orders
        SELECT * FROM OrdersWithItems 
        WHERE isactive = false
        ORDER BY order_time DESC
        LIMIT 10
      )
      ORDER BY order_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Home route
// Modify the home route to handle callbacks


// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Employees endpoints
app.get('/api/employees', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', requireAuth, async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO employees (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/employees/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE employees SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// this currently does not work when the employee has orders
app.delete('/api/employees/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM employees WHERE id = $1', [id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Menu Items endpoints
app.get('/api/menu-items', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu-items', requireAuth, async (req, res) => {
  const { name, price, category } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO menu_items (name, price, category) VALUES ($1, $2, $3) RETURNING *',
      [name, price, category]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.put('/api/menu-items/:name', requireAuth, async (req, res) => {
  const { name } = req.params;
  const { price, category } = req.body;
  try {
    const result = await pool.query(
      'UPDATE menu_items SET price = $1, category = $2 WHERE name = $3 RETURNING *',
      [price, category, name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/menu-items/:name', requireAuth, async (req, res) => {
  const { name } = req.params;
  try {
    await pool.query('DELETE FROM menu_items WHERE name = $1', [name]);
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders endpoints with manager requirement
app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, e.name as employee_name, 
      json_agg(json_build_object('menu_item', oi.menu_item, 'quantity', oi.quantity)) as items
      FROM orders o 
      LEFT JOIN employees e ON o.employee_id = e.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, e.name
      ORDER BY o.order_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('BEGIN');
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [id]);
    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
    await pool.query('COMMIT');
    res.json({ message: 'Order deleted' });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// Update order status
app.put('/api/orders/:id/status', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, e.name as employee_name, 
      json_agg(json_build_object('menu_item', oi.menu_item, 'quantity', oi.quantity)) as items
      FROM orders o 
      LEFT JOIN employees e ON o.employee_id = e.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, e.name, o.isactive
      ORDER BY o.order_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order isActive status
app.put('/api/orders/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET isactive = $1 WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
