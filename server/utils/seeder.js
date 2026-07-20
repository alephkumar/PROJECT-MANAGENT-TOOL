/**
 * Seeds the database with sample users, projects, and tasks.
 * Run with: npm run seed
 *
 * WARNING: This clears existing Users/Projects/Tasks/Notifications collections
 * before inserting sample data. Do not run against a production database.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Project.deleteMany(),
    Task.deleteMany(),
    Notification.deleteMany(),
  ]);

  console.log('Creating users...');
  // Passwords are hashed automatically via the User model's pre-save hook
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@pmt.com',
    password: 'admin123',
    role: 'admin',
  });

  const member1 = await User.create({
    name: 'Alice Johnson',
    email: 'alice@pmt.com',
    password: 'member123',
    role: 'member',
  });

  const member2 = await User.create({
    name: 'Bob Smith',
    email: 'bob@pmt.com',
    password: 'member123',
    role: 'member',
  });

  const member3 = await User.create({
    name: 'Carol Davis',
    email: 'carol@pmt.com',
    password: 'member123',
    role: 'member',
  });

  console.log('Creating projects...');
  const project1 = await Project.create({
    title: 'E-Commerce Website Redesign',
    description: 'Complete overhaul of the online store UI/UX and checkout flow.',
    priority: 'High',
    status: 'In Progress',
    progress: 45,
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-08-30'),
    members: [member1._id, member2._id],
    createdBy: admin._id,
  });

  const project2 = await Project.create({
    title: 'Mobile App - Customer Portal',
    description: 'Native mobile app for customer self-service and support tickets.',
    priority: 'Medium',
    status: 'Not Started',
    progress: 0,
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-11-15'),
    members: [member2._id, member3._id],
    createdBy: admin._id,
  });

  const project3 = await Project.create({
    title: 'Internal Analytics Dashboard',
    description: 'Reporting dashboard for internal teams to track KPIs.',
    priority: 'Low',
    status: 'Completed',
    progress: 100,
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-05-30'),
    members: [member1._id, member3._id],
    createdBy: admin._id,
  });

  console.log('Creating tasks...');
  await Task.create([
    {
      title: 'Design homepage wireframes',
      description: 'Create low-fidelity wireframes for the new homepage layout.',
      assignedTo: member1._id,
      projectId: project1._id,
      priority: 'High',
      status: 'Completed',
      deadline: new Date('2026-06-15'),
      estimatedHours: 12,
      actualHours: 14,
      createdBy: admin._id,
    },
    {
      title: 'Implement checkout API integration',
      description: 'Connect the frontend checkout flow to the payment gateway API.',
      assignedTo: member2._id,
      projectId: project1._id,
      priority: 'High',
      status: 'In Progress',
      deadline: new Date('2026-07-20'),
      estimatedHours: 20,
      actualHours: 10,
      createdBy: admin._id,
    },
    {
      title: 'Write product listing tests',
      description: 'Unit and integration tests for the product listing page.',
      assignedTo: member1._id,
      projectId: project1._id,
      priority: 'Medium',
      status: 'To Do',
      deadline: new Date('2026-07-25'),
      estimatedHours: 8,
      actualHours: 0,
      createdBy: admin._id,
    },
    {
      title: 'Research push notification providers',
      description: 'Compare Firebase Cloud Messaging vs OneSignal for the mobile app.',
      assignedTo: member3._id,
      projectId: project2._id,
      priority: 'Low',
      status: 'To Do',
      deadline: new Date('2026-08-10'),
      estimatedHours: 6,
      actualHours: 0,
      createdBy: admin._id,
    },
    {
      title: 'Set up CI/CD pipeline',
      description: 'Automate build and deploy pipeline for the analytics dashboard.',
      assignedTo: member3._id,
      projectId: project3._id,
      priority: 'Medium',
      status: 'Completed',
      deadline: new Date('2026-04-01'),
      estimatedHours: 10,
      actualHours: 9,
      createdBy: admin._id,
    },
  ]);

  console.log('Creating sample notifications...');
  await Notification.create([
    {
      user: member1._id,
      type: 'assignment',
      message: 'You have been assigned a new task: "Design homepage wireframes"',
      relatedProject: project1._id,
      isRead: true,
    },
    {
      user: member2._id,
      type: 'deadline',
      message: 'Task "Implement checkout API integration" is due soon',
      relatedProject: project1._id,
      isRead: false,
    },
  ]);

  console.log('\n✅ Seed data created successfully!\n');
  console.log('Sample login credentials:');
  console.log('  Admin  → admin@pmt.com / admin123');
  console.log('  Member → alice@pmt.com / member123');
  console.log('  Member → bob@pmt.com   / member123');
  console.log('  Member → carol@pmt.com / member123\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
