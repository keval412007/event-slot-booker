const express = require('express');
const router = express.Router();

const {
  cancelBooking,
} = require('../controllers/bookingController');

// Routes for /api/bookings
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
