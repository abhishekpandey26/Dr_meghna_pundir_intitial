const axios = require('axios');
const Appointment = require('../models/Appointment');
const SlotLock = require('../models/SlotLock');
const dotenv = require('dotenv');
const { sendBookingEmail } = require('../utils/emailService');
dotenv.config();

const API_KEY = process.env.INSTAMOJO_API_KEY;
const AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;
let BASE_URL = process.env.INSTAMOJO_BASE_URL || 'https://www.instamojo.com/api/1.1/';
if (BASE_URL && !BASE_URL.endsWith('/')) {
  BASE_URL += '/';
}

exports.createPaymentRequest = async (req, res) => {
  try {
    const { date, startTime, patientData } = req.body;

    if (patientData && !patientData.patientName && patientData.name) {
      patientData.patientName = patientData.name;
    }

    // Use test URL if keys look like sandbox or if specifically requested
    const targetUrl = API_KEY.startsWith('test_') ? 'https://test.instamojo.com/api/1.1/' : BASE_URL;

    console.log('--- Initiating Payment Request ---');
    console.log('Target Environment:', targetUrl.includes('test') ? 'SANDBOX' : 'PRODUCTION');
    console.log('Date:', date, 'Time:', startTime);
    console.log('X-Api-Key Length:', API_KEY ? API_KEY.length : 0);
    console.log('X-Auth-Token Length:', AUTH_TOKEN ? AUTH_TOKEN.length : 0);

    if (!API_KEY || !AUTH_TOKEN) {
      return res.status(500).json({ error: 'Server configuration error: Missing Payment Credentials.' });
    }

    // 1. Upsert appointment
    const patientId = `DM-${Date.now().toString().slice(-6)}`;
    const appointment = await Appointment.findOneAndUpdate(
      { date, startTime },
      { 
        ...patientData,
        patientId,
        status: 'PAYMENT_PENDING',
        paymentMethod: 'ONLINE'
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    // 2. Prepare Instamojo data
    const payload = {
      purpose: `Consultation Fee - ${patientData.patientName}`,
      amount: '11.00',
      buyer_name: patientData.patientName,
      email: patientData.email,
      phone: patientData.mobile,
      redirect_url: `http://localhost:3000/?view=booking&payment_status=check&appointmentId=${appointment._id}`,
      send_email: false,
      send_sms: false,
      allow_repeated_payments: false
    };

    const response = await axios.post(`${targetUrl}payment-requests/`, payload, {
      headers: {
        'X-Api-Key': API_KEY,
        'X-Auth-Token': AUTH_TOKEN,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      transformRequest: [(data) => {
        return Object.entries(data)
          .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
          .join('&');
      }]
    });

    if (response.data.success) {
      appointment.paymentRequestId = response.data.payment_request.id;
      await appointment.save();

      return res.json({ 
        success: true, 
        longurl: response.data.payment_request.longurl,
        appointmentId: appointment._id
      });
    } else {
      console.error('Instamojo Error Body:', response.data);
      throw new Error(`Instamojo rejected request: ${response.data.message || 'Unknown permission error'}`);
    }

  } catch (error) {
    const errorDetails = error.response ? error.response.data : error.message;
    console.error('Payment Error Details:', errorDetails);
    res.status(500).json({ 
      error: 'Instamojo Gateway Refusal', 
      details: errorDetails 
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { payment_id, payment_request_id, appointmentId } = req.body;

    const response = await axios.get(`${BASE_URL}payment-requests/${payment_request_id}/${payment_id}/`, {
      headers: {
        'X-Api-Key': API_KEY,
        'X-Auth-Token': AUTH_TOKEN
      }
    });

    const paymentData = response.data.payment_request;
    const paymentItem = paymentData.payment;

    if (paymentItem.status === 'Credit') {
      // Payment Successful
      const appt = await Appointment.findById(appointmentId);
      if (appt) {
        appt.status = 'CONFIRMED'; // Or PENDING if doctor needs to approve, but usually paid = confirmed
        appt.paymentId = payment_id;
        appt.paymentStatus = 'Credit';
        await appt.save();

        // Remove slot lock
        await SlotLock.findOneAndDelete({ date: appt.date, startTime: appt.startTime });

        // Dispatch confirmation email asynchronously (does not block HTTP response)
        sendBookingEmail(appt).catch((emailErr) => {
          console.error('Asynchronous email trigger failure:', emailErr.message);
        });
      }

      return res.json({ success: true, message: 'Payment verified and appointment confirmed.' });
    } else {
      return res.json({ success: false, message: 'Payment status: ' + paymentItem.status });
    }

  } catch (error) {
    console.error('Verification Error:', error.message);
    res.status(500).json({ error: 'Verification protocol failed.' });
  }
};
