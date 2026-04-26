const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Mini CRM API running' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  let mongoUri = MONGO_URI;

  // If no MONGO_URI provided or it's the default localhost, use in-memory MongoDB
  if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    console.log('🔧 No external MongoDB found — starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log(`📦 In-memory MongoDB started at: ${mongoUri}`);

    // Seed demo data automatically
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB');
    await seedDemoData();
  } else {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Mini CRM Server running on http://localhost:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Login: admin@crm.com  |  Password: admin123');
    console.log('📧 Agent: sarah@crm.com  |  Password: agent123');
    console.log('📧 Agent: mike@crm.com   |  Password: agent123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
};

const seedDemoData = async () => {
  const User = require('./models/User');
  const Company = require('./models/Company');
  const Lead = require('./models/Lead');
  const Task = require('./models/Task');

  const existing = await User.countDocuments();
  if (existing > 0) return; // Already seeded

  // Use create() so the pre-save bcrypt hook fires exactly once per user
  const users = await Promise.all([
    User.create({ name: 'Admin User', email: 'admin@crm.com', password: 'admin123', role: 'admin' }),
    User.create({ name: 'Sarah Johnson', email: 'sarah@crm.com', password: 'agent123', role: 'agent' }),
    User.create({ name: 'Mike Chen', email: 'mike@crm.com', password: 'agent123', role: 'agent' }),
  ]);

  const companies = await Company.insertMany([
    { name: 'TechCorp Solutions', industry: 'Technology', location: 'San Francisco, CA' },
    { name: 'GreenLeaf Industries', industry: 'Manufacturing', location: 'Austin, TX' },
    { name: 'Blue Ocean Finance', industry: 'Finance', location: 'New York, NY' },
    { name: 'Apex Marketing', industry: 'Marketing', location: 'Chicago, IL' },
  ]);

  const leads = await Lead.insertMany([
    { name: 'Alice Walker', email: 'alice@techcorp.com', phone: '+1-555-0101', status: 'Qualified', assignedTo: users[1]._id, company: companies[0]._id },
    { name: 'Bob Martinez', email: 'bob@greenleaf.com', phone: '+1-555-0102', status: 'Contacted', assignedTo: users[2]._id, company: companies[1]._id },
    { name: 'Carol Davis', email: 'carol@blueocean.com', phone: '+1-555-0103', status: 'New', assignedTo: users[1]._id, company: companies[2]._id },
    { name: 'David Lee', email: 'david@apex.com', phone: '+1-555-0104', status: 'Qualified', assignedTo: users[2]._id, company: companies[3]._id },
    { name: 'Eva Thompson', email: 'eva@gmail.com', phone: '+1-555-0105', status: 'Lost', assignedTo: users[0]._id, company: null },
    { name: 'Frank Wilson', email: 'frank@techcorp.com', phone: '+1-555-0106', status: 'New', assignedTo: users[1]._id, company: companies[0]._id },
  ]);

  const today = new Date();
  await Task.insertMany([
    { title: 'Follow up with Alice Walker', lead: leads[0]._id, assignedTo: users[1]._id, dueDate: today, status: 'Pending' },
    { title: 'Send proposal to Bob Martinez', lead: leads[1]._id, assignedTo: users[2]._id, dueDate: today, status: 'In Progress' },
    { title: 'Schedule demo for Carol Davis', lead: leads[2]._id, assignedTo: users[1]._id, dueDate: new Date(Date.now() + 86400000 * 2), status: 'Pending' },
    { title: 'Close deal with David Lee', lead: leads[3]._id, assignedTo: users[2]._id, dueDate: new Date(Date.now() + 86400000), status: 'Completed' },
    { title: 'Re-engage Eva Thompson', lead: leads[4]._id, assignedTo: users[0]._id, dueDate: new Date(Date.now() + 86400000 * 3), status: 'Completed' },
  ]);

  console.log('🌱 Demo data seeded successfully!');
};

startServer().catch((err) => {
  console.error('❌ Server startup failed:', err.message);
  process.exit(1);
});
