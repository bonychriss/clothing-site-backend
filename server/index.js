const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load environment variables from .env file
dotenv.config();

const app = express();


// Use CORS middleware for deployment
app.use(cors({
  origin: 'https://sabor-espanol-vrwk.onrender.com', // allow deployed frontend
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).catch(err => {
  console.error('Initial MongoDB connection error:', err.message);
  console.error('Please ensure your IP is whitelisted in MongoDB Atlas and your MONGO_URI is correct in the .env file.');
  process.exit(1); // Exit the process with a failure code
});

// Basic route
app.get('/', (req, res) => {
  res.send('Clothing Store API');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Check database connection state
  const isConnected = mongoose.connection.readyState === 1;
  if (isConnected) {
    res.status(200).json({ status: 'ok', database: 'connected' });
  } else {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// --- Admin User Seeding ---
// This function runs on server startup to ensure the admin user exists.
const seedAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('Admin credentials not found in .env file. Skipping admin seed.');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({ name: 'Sabor Admin', email: adminEmail, password: hashedPassword, role: 'admin' });
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};
mongoose.connection.once('open', () => {
  console.log('MongoDB connected...');
  seedAdminUser();
});

// TODO: Add routes for products, users, cart, orders
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/featured-images', require('./routes/featuredImages'));
app.use('/api/best-picks', require('./routes/bestPicks'));


const path = require('path');

// Serve static React files
app.use(express.static(path.join(__dirname, '../client/build')));

// Serve images from React public folder
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));


// Catch-all route: serve React index.html for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).send('API route not found');
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
