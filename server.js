/* ========================================
   Latino's Barbershop — Booking Server
   ======================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ---------- Database Setup ----------
const db = new Database(path.join(__dirname, 'bookings.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

// ---------- Email Transporter ----------
let transporter = null;

const isEmailConfigured = () => {
  return process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'your-app-password-here';
};

if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify((err) => {
    if (err) {
      console.log('⚠️  Email setup issue:', err.message);
      console.log('   Bookings will still be saved, but email notifications won\'t be sent.');
    } else {
      console.log('✅ Email notifications enabled');
    }
  });
} else {
  console.log('⚠️  Email not configured. Edit .env to enable owner notifications.');
  console.log('   Bookings will still be saved to the database.');
}

// ---------- Send Owner Notification ----------
async function sendOwnerNotification(booking) {
  if (!transporter || !process.env.OWNER_EMAIL) return;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #2a2a2a;">
      <div style="background: linear-gradient(135deg, #C9A84C, #E8C46A); padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #0D0D0D; font-size: 20px; letter-spacing: 2px;">✂️ NEW APPOINTMENT BOOKED</h1>
      </div>
      <div style="padding: 28px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Customer</td>
            <td style="padding: 10px 0; color: #f5f5f5; font-size: 15px; font-weight: 600; text-align: right;">${booking.customer_name}</td>
          </tr>
          <tr><td colspan="2" style="border-bottom: 1px solid #2a2a2a;"></td></tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Phone</td>
            <td style="padding: 10px 0; color: #C9A84C; font-size: 15px; font-weight: 600; text-align: right;">
              <a href="tel:${booking.customer_phone}" style="color: #C9A84C; text-decoration: none;">${booking.customer_phone}</a>
            </td>
          </tr>
          <tr><td colspan="2" style="border-bottom: 1px solid #2a2a2a;"></td></tr>
          ${booking.customer_email ? `<tr>
            <td style="padding: 10px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Email</td>
            <td style="padding: 10px 0; color: #f5f5f5; font-size: 15px; text-align: right;">${booking.customer_email}</td>
          </tr>
          <tr><td colspan="2" style="border-bottom: 1px solid #2a2a2a;"></td></tr>` : ''}
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Service</td>
            <td style="padding: 10px 0; color: #f5f5f5; font-size: 15px; font-weight: 600; text-align: right;">${booking.service}</td>
          </tr>
          <tr><td colspan="2" style="border-bottom: 1px solid #2a2a2a;"></td></tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Date</td>
            <td style="padding: 10px 0; color: #E8C46A; font-size: 15px; font-weight: 700; text-align: right;">${booking.date}</td>
          </tr>
          <tr><td colspan="2" style="border-bottom: 1px solid #2a2a2a;"></td></tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Time</td>
            <td style="padding: 10px 0; color: #E8C46A; font-size: 15px; font-weight: 700; text-align: right;">${booking.time}</td>
          </tr>
          ${booking.notes ? `<tr><td colspan="2" style="border-bottom: 1px solid #2a2a2a;"></td></tr>
          <tr>
            <td style="padding: 10px 0; color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Notes</td>
            <td style="padding: 10px 0; color: #f5f5f5; font-size: 14px; text-align: right;">${booking.notes}</td>
          </tr>` : ''}
        </table>
      </div>
      <div style="background: #141414; padding: 16px; text-align: center; color: #555; font-size: 12px;">
        Latino's Barbershop · Booking System
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Latino's Barbershop" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `🔔 New Booking: ${booking.service} — ${booking.date} at ${booking.time}`,
      html: html,
    });
    console.log(`📧 Notification sent to ${process.env.OWNER_EMAIL}`);
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

// ---------- API Routes ----------

// Book appointment
app.post('/api/book', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_email, service, date, time, notes } = req.body;

    // Validation
    if (!customer_name || !customer_phone || !service || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (name, phone, service, date, time).'
      });
    }

    // Check for duplicate booking (same date + time)
    const existing = db.prepare(
      'SELECT id FROM bookings WHERE date = ? AND time = ? AND status != ?'
    ).get(date, time, 'cancelled');

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }

    // Insert booking
    const stmt = db.prepare(`
      INSERT INTO bookings (customer_name, customer_phone, customer_email, service, date, time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(customer_name, customer_phone, customer_email || null, service, date, time, notes || null);

    const booking = {
      id: result.lastInsertRowid,
      customer_name,
      customer_phone,
      customer_email,
      service,
      date,
      time,
      notes
    };

    // Send email notification (non-blocking)
    const emailSent = await sendOwnerNotification(booking);

    res.json({
      success: true,
      message: 'Appointment booked successfully!',
      booking: {
        id: booking.id,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        emailSent
      }
    });

    console.log(`✅ Booking #${booking.id}: ${service} on ${date} at ${time} for ${customer_name}`);

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again or call us directly.' });
  }
});

// Get booked time slots for a given date (for availability checking)
app.get('/api/booked-slots', (req, res) => {
  const { date } = req.query;
  if (!date) return res.json({ slots: [] });

  const rows = db.prepare(
    'SELECT time FROM bookings WHERE date = ? AND status != ?'
  ).all(date, 'cancelled');

  res.json({ slots: rows.map(r => r.time) });
});

// Admin: list all bookings
app.get('/api/bookings', (req, res) => {
  const bookings = db.prepare(
    'SELECT * FROM bookings ORDER BY date DESC, time DESC'
  ).all();
  res.json({ bookings });
});

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   ✂️  Latino\'s Barbershop Server            ║');
  console.log(`║   🌐 http://localhost:${PORT}                  ║`);
  console.log('║   📅 Booking system active                 ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
});
