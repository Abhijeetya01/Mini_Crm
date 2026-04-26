/**
 * Seed Script - Run with: npm run seed
 * Creates admin user + sample data
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Company = require('./models/Company');
const Lead = require('./models/Lead');
const Task = require('./models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Company.deleteMany(), Lead.deleteMany(), Task.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.insertMany([
      { name: 'Admin User', email: 'admin@crm.com', password: 'admin123', role: 'admin' },
      { name: 'Sarah Johnson', email: 'sarah@crm.com', password: 'agent123', role: 'agent' },
      { name: 'Mike Chen', email: 'mike@crm.com', password: 'agent123', role: 'agent' },
    ]);
    console.log('👥 Users created');

    // Create companies
    const companies = await Company.insertMany([
      { name: 'TechCorp Solutions', industry: 'Technology', location: 'San Francisco, CA' },
      { name: 'GreenLeaf Industries', industry: 'Manufacturing', location: 'Austin, TX' },
      { name: 'Blue Ocean Finance', industry: 'Finance', location: 'New York, NY' },
      { name: 'Apex Marketing', industry: 'Marketing', location: 'Chicago, IL' },
    ]);
    console.log('🏢 Companies created');

    // Create leads
    const leads = await Lead.insertMany([
      { name: 'Alice Walker', email: 'alice@techcorp.com', phone: '+1-555-0101', status: 'Qualified', assignedTo: users[1]._id, company: companies[0]._id },
      { name: 'Bob Martinez', email: 'bob@greenleaf.com', phone: '+1-555-0102', status: 'Contacted', assignedTo: users[2]._id, company: companies[1]._id },
      { name: 'Carol Davis', email: 'carol@blueocean.com', phone: '+1-555-0103', status: 'New', assignedTo: users[1]._id, company: companies[2]._id },
      { name: 'David Lee', email: 'david@apex.com', phone: '+1-555-0104', status: 'Qualified', assignedTo: users[2]._id, company: companies[3]._id },
      { name: 'Eva Thompson', email: 'eva@gmail.com', phone: '+1-555-0105', status: 'Lost', assignedTo: users[0]._id, company: null },
      { name: 'Frank Wilson', email: 'frank@techcorp.com', phone: '+1-555-0106', status: 'New', assignedTo: users[1]._id, company: companies[0]._id },
    ]);
    console.log('🎯 Leads created');

    // Create tasks (some due today for dashboard stats)
    const today = new Date();
    await Task.insertMany([
      { title: 'Follow up with Alice Walker', lead: leads[0]._id, assignedTo: users[1]._id, dueDate: today, status: 'Pending' },
      { title: 'Send proposal to Bob Martinez', lead: leads[1]._id, assignedTo: users[2]._id, dueDate: today, status: 'In Progress' },
      { title: 'Schedule demo for Carol Davis', lead: leads[2]._id, assignedTo: users[1]._id, dueDate: new Date(Date.now() + 86400000 * 2), status: 'Pending' },
      { title: 'Close deal with David Lee', lead: leads[3]._id, assignedTo: users[2]._id, dueDate: new Date(Date.now() + 86400000), status: 'Completed' },
      { title: 'Re-engage Eva Thompson', lead: leads[4]._id, assignedTo: users[0]._id, dueDate: new Date(Date.now() + 86400000 * 3), status: 'Completed' },
    ]);
    console.log('✅ Tasks created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Login: admin@crm.com  |  Password: admin123');
    console.log('📧 Agent: sarah@crm.com  |  Password: agent123');
    console.log('📧 Agent: mike@crm.com   |  Password: agent123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    mongoose.disconnect();
  }
};

seed();
