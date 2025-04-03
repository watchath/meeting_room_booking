const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Import Services
const { updateRoomStatus } = require('./services/roomStatusService');

// Import Middlewares
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected');
  
  // ตั้งค่า cron job ให้ทำงานทุก 5 นาที
  // สามารถปรับค่าได้ตามความเหมาะสม (ทุก 1 นาที, ทุก 10 นาที, ทุก 1 ชั่วโมง)
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Running scheduled room status update');
    await updateRoomStatus();
  });
  
  // ทำการอัพเดทสถานะห้องทันทีเมื่อเริ่มเซิร์ฟเวอร์
  updateRoomStatus();
})
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
// process.on('unhandledRejection', (err, promise) => {
//   console.error(`Error: ${err.message}`);
//   // Close server & exit process
//   // server.close(() => process.exit(1));
// });
