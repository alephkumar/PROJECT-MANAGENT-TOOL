const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

/**
 * Creates a "deadline" notification for tasks due within the next 24 hours,
 * and an "overdue" notification for tasks past their deadline — for any
 * incomplete, assigned task that doesn't already have that notification
 * type logged within the last day (prevents duplicate spam on every run).
 */
const checkDeadlinesAndOverdue = async () => {
  try {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // ---- Upcoming deadlines (due within 24h, not completed) ----
    const dueSoonTasks = await Task.find({
      status: { $ne: 'Completed' },
      assignedTo: { $ne: null },
      deadline: { $gte: now, $lte: in24h },
    });

    for (const task of dueSoonTasks) {
      const alreadyNotified = await Notification.findOne({
        user: task.assignedTo,
        relatedTask: task._id,
        type: 'deadline',
        createdAt: { $gte: oneDayAgo },
      });
      if (!alreadyNotified) {
        await Notification.create({
          user: task.assignedTo,
          type: 'deadline',
          message: `Task "${task.title}" is due within 24 hours`,
          relatedTask: task._id,
          relatedProject: task.projectId,
        });
      }
    }

    // ---- Overdue tasks (past deadline, not completed) ----
    const overdueTasks = await Task.find({
      status: { $ne: 'Completed' },
      assignedTo: { $ne: null },
      deadline: { $lt: now },
    });

    for (const task of overdueTasks) {
      const alreadyNotified = await Notification.findOne({
        user: task.assignedTo,
        relatedTask: task._id,
        type: 'overdue',
        createdAt: { $gte: oneDayAgo },
      });
      if (!alreadyNotified) {
        await Notification.create({
          user: task.assignedTo,
          type: 'overdue',
          message: `Task "${task.title}" is overdue`,
          relatedTask: task._id,
          relatedProject: task.projectId,
        });
      }
    }

    if (dueSoonTasks.length || overdueTasks.length) {
      console.log(
        `[scheduler] Notified ${dueSoonTasks.length} upcoming-deadline and ${overdueTasks.length} overdue task(s)`
      );
    }
  } catch (err) {
    console.error('[scheduler] Deadline check failed:', err.message);
  }
};

/**
 * Starts the daily cron job (runs every hour, at minute 0, so deployments
 * that stay warm for less than 24h still get timely notifications).
 * Also runs once immediately on startup so notifications aren't delayed
 * up to an hour after a fresh deploy.
 */
const startNotificationScheduler = () => {
  checkDeadlinesAndOverdue(); // run once on boot

  cron.schedule('0 * * * *', checkDeadlinesAndOverdue); // then every hour

  console.log('Notification scheduler started (hourly deadline/overdue checks)');
};

module.exports = { startNotificationScheduler, checkDeadlinesAndOverdue };
