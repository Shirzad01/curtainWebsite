const {
  getMailConfigError,
  sendMail
} = require('../_lib/mail');
const {
  requireAdminAuth
} = require('../_lib/admin-auth');
const {
  getAppointments,
  handleOptions,
  readJson,
  sendJson,
  upsertAppointment
} = require('../_lib/store');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;

  if (req.method === 'GET') {
    if (!requireAdminAuth(req, res)) return;
    sendJson(res, 200, await getAppointments());
    return;
  }

  if (req.method === 'POST') {
    const payload = await readJson(req);
    const now = new Date().toISOString();
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim();
    const phone = String(payload.phone || '').trim();
    const serviceType = String(payload.serviceType || 'Measurement').trim();
    const preferredDate = String(payload.preferredDate || '').trim();
    const preferredTime = String(payload.preferredTime || '').trim();
    const notes = String(payload.notes || '').trim();
    const source = String(payload.source || 'website').trim();

    if (!name || !email || !phone || !preferredDate || !preferredTime) {
      sendJson(res, 400, { error: 'Missing required fields' });
      return;
    }

    const row = {
      id: `appt-${Date.now()}`,
      name,
      email,
      phone,
      serviceType,
      preferredDate,
      preferredTime,
      notes,
      status: 'Pending',
      source,
      createdAt: now,
      updatedAt: now
    };

    await upsertAppointment(row);

    const mailConfigError = getMailConfigError();
    if (!mailConfigError) {
      const formattedTime = `${preferredDate} at ${preferredTime}`;
      
      // Send customer confirmation email
      await sendMail({
        to: email,
        subject: `Appointment Confirmed - LustreView Blinds`,
        html: `
          <h2>Appointment Confirmed!</h2>
          <p>Hi ${name},</p>
          <p>Your appointment has been successfully registered. Our team will contact you soon to confirm the details.</p>
          
          <h3>Appointment Details:</h3>
          <ul>
            <li><strong>Service Type:</strong> ${serviceType}</li>
            <li><strong>Date:</strong> ${preferredDate}</li>
            <li><strong>Time:</strong> ${preferredTime}</li>
            <li><strong>Phone:</strong> ${phone}</li>
            ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
          </ul>
          
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            If you need to reschedule or cancel, please call us or reply to this email.
          </p>
        `
      });

      // Send admin notification email
      await sendMail({
        to: 'hello@lustreviewblinds.ca',
        subject: `New Appointment Request: ${name}`,
        html: `
          <h2>New Appointment Request</h2>
          <h3>Customer Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
          </ul>
          
          <h3>Appointment Details:</h3>
          <ul>
            <li><strong>Service Type:</strong> ${serviceType}</li>
            <li><strong>Preferred Date:</strong> ${preferredDate}</li>
            <li><strong>Preferred Time:</strong> ${preferredTime}</li>
            ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
          </ul>
          
          <p style="margin-top: 20px;">
            <a href="https://lustreviewblinds.ca/portal-7f3a9c/index.html">View in Admin Portal</a>
          </p>
        `
      });
    }

    sendJson(res, 201, row);
  }
};
