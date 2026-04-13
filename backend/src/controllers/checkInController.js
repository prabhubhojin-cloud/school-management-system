const StaffCheckIn = require('../models/StaffCheckIn');

// Haversine formula — returns distance in meters between two coordinates
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @desc    Staff check-in with GPS
// @route   POST /api/checkins
// @access  Private (teacher, office_incharge, accountant)
exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude, note } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'GPS coordinates are required' });
    }

    const schoolLat = parseFloat(process.env.SCHOOL_LATITUDE);
    const schoolLng = parseFloat(process.env.SCHOOL_LONGITUDE);
    const radiusMeters = parseFloat(process.env.SCHOOL_RADIUS_METERS) || 300;

    if (!schoolLat || !schoolLng) {
      return res.status(500).json({ success: false, message: 'School location is not configured on the server' });
    }

    const distanceMeters = getDistanceMeters(latitude, longitude, schoolLat, schoolLng);
    const isWithinRange = distanceMeters <= radiusMeters;

    const today = new Date().toISOString().split('T')[0];

    // Capture device fingerprint
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      '';
    const userAgent = req.headers['user-agent'] || '';

    // If already checked in today → check-out
    const existing = await StaffCheckIn.findOne({ user: req.user._id, date: today });

    if (existing) {
      existing.checkOutTime = new Date();
      await existing.save();
      return res.json({
        success: true,
        message: 'Checked out successfully',
        data: existing,
        action: 'checkout',
      });
    }

    // Detect if another user already checked in from the same device today
    let suspiciousDevice = false;
    let suspiciousNote = '';

    if (ip || userAgent) {
      const sameDeviceRecord = await StaffCheckIn.findOne({
        date: today,
        user: { $ne: req.user._id },
        'deviceInfo.ip': ip,
        'deviceInfo.userAgent': userAgent,
      }).populate('user', 'email');

      if (sameDeviceRecord) {
        suspiciousDevice = true;
        suspiciousNote = `Same device used for check-in as ${sameDeviceRecord.user?.email || 'another user'} (${sameDeviceRecord.checkInTime ? new Date(sameDeviceRecord.checkInTime).toLocaleTimeString() : ''})`;

        // Also flag the earlier record retroactively
        if (!sameDeviceRecord.suspiciousDevice) {
          sameDeviceRecord.suspiciousDevice = true;
          sameDeviceRecord.suspiciousNote = `Same device later used by ${req.user.email}`;
          await sameDeviceRecord.save();
        }
      }
    }

    const checkIn = await StaffCheckIn.create({
      user: req.user._id,
      role: req.user.role,
      date: today,
      checkInTime: new Date(),
      location: { latitude, longitude },
      isWithinRange,
      distanceMeters: Math.round(distanceMeters),
      note: note || '',
      deviceInfo: { ip, userAgent },
      suspiciousDevice,
      suspiciousNote,
    });

    await checkIn.populate('user', 'email role');

    res.status(201).json({
      success: true,
      message: isWithinRange
        ? 'Checked in successfully — you are at school'
        : `Checked in but you appear to be ${Math.round(distanceMeters)}m away from school`,
      data: checkIn,
      action: 'checkin',
      warning: suspiciousDevice ? suspiciousNote : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get today's check-in status for logged-in user
// @route   GET /api/checkins/my-status
// @access  Private
exports.getMyStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = await StaffCheckIn.findOne({ user: req.user._id, date: today });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all check-ins (admin)
// @route   GET /api/checkins
// @access  Private (admin)
exports.getAllCheckIns = async (req, res) => {
  try {
    const { date, role, userId, fromDate, toDate, checkInAfter } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (userId) filter.user = userId;

    // Date range mode (for member history)
    if (fromDate && toDate) {
      filter.date = { $gte: fromDate, $lte: toDate };
    } else {
      // Single date mode — default to today
      filter.date = date || new Date().toISOString().split('T')[0];
    }

    let records = await StaffCheckIn.find(filter)
      .populate('user', 'email role')
      .sort({ checkInTime: 1 });

    // Filter by check-in time after a given time (HH:MM) in single-date mode
    if (checkInAfter && !fromDate) {
      const [filterHour, filterMin] = checkInAfter.split(':').map(Number);
      records = records.filter(r => {
        const d = new Date(r.checkInTime);
        const totalMins = d.getHours() * 60 + d.getMinutes();
        return totalMins >= filterHour * 60 + filterMin;
      });
    }

    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get staff members for dropdown
// @route   GET /api/checkins/staff
// @access  Private (admin)
exports.getStaffList = async (req, res) => {
  try {
    const User = require('../models/User');
    const staff = await User.find({
      role: { $in: ['teacher', 'office_incharge', 'accountant'] },
      isActive: true,
    }).select('email role').sort({ email: 1 });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get school location config (so frontend can show it)
// @route   GET /api/checkins/school-location
// @access  Private
exports.getSchoolLocation = async (req, res) => {
  res.json({
    success: true,
    data: {
      latitude: parseFloat(process.env.SCHOOL_LATITUDE) || null,
      longitude: parseFloat(process.env.SCHOOL_LONGITUDE) || null,
      radiusMeters: parseFloat(process.env.SCHOOL_RADIUS_METERS) || 300,
      configured: !!(process.env.SCHOOL_LATITUDE && process.env.SCHOOL_LONGITUDE),
    },
  });
};
