const {
  requireAdminAuth
} = require('../../_lib/admin-auth');
const {
  getAppointments,
  handleOptions,
  readJson,
  sendJson,
  upsertAppointment,
  deleteAppointment
} = require('../../_lib/store');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;

  const appointmentId = String(req.query.id || '').trim();
  if (!appointmentId) {
    sendJson(res, 400, { error: 'Appointment ID is required' });
    return;
  }

  if (req.method === 'PUT') {
    if (!requireAdminAuth(req, res)) return;

    const payload = await readJson(req);
    const status = String(payload.status || '').trim();

    if (!status) {
      sendJson(res, 400, { error: 'Status is required' });
      return;
    }

    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
      sendJson(res, 400, { error: 'Invalid status value' });
      return;
    }

    try {
      // Fetch existing appointment to preserve all data
      const allAppointments = await getAppointments();
      const existing = allAppointments.find(a => a.id === appointmentId);
      
      if (!existing) {
        sendJson(res, 404, { error: 'Appointment not found' });
        return;
      }

      const updated = {
        ...existing,
        status,
        updatedAt: new Date().toISOString()
      };
      
      await upsertAppointment(updated);
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 500, { error: 'Failed to update appointment' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    if (!requireAdminAuth(req, res)) return;

    try {
      await deleteAppointment(appointmentId);
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 500, { error: 'Failed to delete appointment' });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
};
