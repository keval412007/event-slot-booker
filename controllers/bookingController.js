const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const EventSlot = require('../models/EventSlot');

// @desc    Book a student into a slot
// @route   POST /api/slots/:id/book
exports.bookSlot = async (req, res) => {
  try {
    const { id: slotId } = req.params;
    const { studentName, email, rollNo } = req.body;

    // Validate slotId
    if (!mongoose.Types.ObjectId.isValid(slotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID format',
      });
    }

    // Validate required body fields
    if (!studentName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Student name and email are required to book a slot',
      });
    }

    // Check if slot exists
    const slot = await EventSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Event slot not found',
      });
    }

    // Check if slot is Open
    if (slot.status !== 'Open') {
      return res.status(400).json({
        success: false,
        message: 'Cannot book this slot because its status is Closed',
      });
    }

    // Check capacity: count only active Booked records
    const activeBookingsCount = await Booking.countDocuments({
      slotId,
      bookingStatus: 'Booked',
    });

    if (activeBookingsCount >= slot.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Full Slot: This slot has reached maximum capacity and cannot accept more bookings',
      });
    }

    // Duplicate check: The same email should not have two active bookings for the same slot
    const normalizedEmail = email.trim().toLowerCase();
    const existingBooking = await Booking.findOne({
      slotId,
      email: normalizedEmail,
      bookingStatus: 'Booked',
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Booking: An active booking already exists with this email for this slot',
      });
    }

    // Create booking
    const booking = await Booking.create({
      slotId,
      studentName: studentName.trim(),
      email: normalizedEmail,
      rollNo: rollNo ? rollNo.trim() : undefined,
      bookingStatus: 'Booked',
    });

    res.status(201).json({
      success: true,
      message: 'Slot booked successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error booking slot',
      error: error.message,
    });
  }
};

// @desc    View all active bookings for a specific slot
// @route   GET /api/slots/:id/bookings
exports.getSlotBookings = async (req, res) => {
  try {
    const { id: slotId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(slotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID format',
      });
    }

    const slot = await EventSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Event slot not found',
      });
    }

    // Fetch active bookings for this slot
    const bookings = await Booking.find({
      slotId,
      bookingStatus: 'Booked',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      slotId,
      eventName: slot.eventName,
      capacity: slot.capacity,
      activeBookingsCount: bookings.length,
      availableSeats: Math.max(0, slot.capacity - bookings.length),
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching slot bookings',
      error: error.message,
    });
  }
};

// @desc    Cancel an existing booking
// @route   PATCH /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled',
      });
    }

    booking.bookingStatus = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seat is now available for other students.',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error cancelling booking',
      error: error.message,
    });
  }
};
