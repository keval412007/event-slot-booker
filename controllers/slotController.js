const mongoose = require('mongoose');
const EventSlot = require('../models/EventSlot');
const Booking = require('../models/Booking');

// @desc    Create a new event slot
// @route   POST /api/slots
exports.createSlot = async (req, res) => {
  try {
    const { eventName, date, startTime, endTime, location, capacity, status } = req.body;

    // Validate required fields
    if (!eventName || !date || !startTime || !endTime || !location || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: eventName, date, startTime, endTime, location, capacity',
      });
    }

    // Validate capacity
    const parsedCapacity = Number(capacity);
    if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive number greater than 0',
      });
    }

    const newSlot = await EventSlot.create({
      eventName,
      date,
      startTime,
      endTime,
      location,
      capacity: parsedCapacity,
      status: status || 'Open',
    });

    res.status(201).json({
      success: true,
      message: 'Event slot created successfully',
      data: newSlot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating slot',
      error: error.message,
    });
  }
};

// @desc    Get all slots with calculated availableSeats
// @route   GET /api/slots
exports.getAllSlots = async (req, res) => {
  try {
    const slots = await EventSlot.find().sort({ createdAt: -1 });

    // Calculate available seats for each slot
    const slotsWithAvailability = await Promise.all(
      slots.map(async (slot) => {
        const activeBookingsCount = await Booking.countDocuments({
          slotId: slot._id,
          bookingStatus: 'Booked',
        });

        const availableSeats = Math.max(0, slot.capacity - activeBookingsCount);

        return {
          ...slot.toObject(),
          activeBookings: activeBookingsCount,
          availableSeats,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: slotsWithAvailability.length,
      data: slotsWithAvailability,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching slots',
      error: error.message,
    });
  }
};

// @desc    Get single slot details with booking count
// @route   GET /api/slots/:id
exports.getSlotById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID format',
      });
    }

    const slot = await EventSlot.findById(id);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Event slot not found',
      });
    }

    const activeBookingsCount = await Booking.countDocuments({
      slotId: slot._id,
      bookingStatus: 'Booked',
    });

    const availableSeats = Math.max(0, slot.capacity - activeBookingsCount);

    res.status(200).json({
      success: true,
      data: {
        ...slot.toObject(),
        activeBookings: activeBookingsCount,
        availableSeats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching slot details',
      error: error.message,
    });
  }
};

// @desc    Delete slot (block delete if active bookings exist)
// @route   DELETE /api/slots/:id
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID format',
      });
    }

    const slot = await EventSlot.findById(id);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Event slot not found',
      });
    }

    // Check if there are active bookings
    const activeBookingsCount = await Booking.countDocuments({
      slotId: id,
      bookingStatus: 'Booked',
    });

    if (activeBookingsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete slot. There are ${activeBookingsCount} active booking(s) associated with this slot.`,
      });
    }

    // Optional: remove cancelled booking history or leave them
    await Booking.deleteMany({ slotId: id });
    await EventSlot.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Event slot deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting slot',
      error: error.message,
    });
  }
};
