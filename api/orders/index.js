const { requireAdminAuth } = require('../_lib/admin-auth');
const {
  getOrders,
  handleOptions,
  readJson,
  sendJson,
  upsertOrder
} = require('../_lib/store');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;

  if (req.method === 'GET') {
    if (!requireAdminAuth(req, res)) return;
    sendJson(res, 200, await getOrders());
    return;
  }

  if (req.method === 'POST') {
    let payload = {};
    try {
      payload = await readJson(req);
    } catch (error) {
      sendJson(res, 400, { error: 'Invalid JSON payload' });
      return;
    }
    const now = new Date().toISOString();
    const customerName = String(payload.customerName || '').trim();
    const email = String(payload.email || '').trim();
    const phone = String(payload.phone || '').trim();
    const paymentMethod = String(payload.paymentMethod || '').trim();
    const shippingAddress = String(payload.shippingAddress || '').trim();
    const city = String(payload.city || '').trim();
    const notes = String(payload.notes || '').trim();
    const items = Array.isArray(payload.items) ? payload.items : [];
    const subtotal = Number(payload.subtotal) || 0;
    const shippingFee = Number(payload.shippingFee) || 0;
    const total = Number(payload.total) || 0;

    if (!customerName || !email || !phone || !paymentMethod || !shippingAddress || !city || !items.length) {
      sendJson(res, 400, { error: 'Missing required order fields' });
      return;
    }

    const row = {
      id: `ord-${Date.now()}`,
      customerName,
      email,
      phone,
      paymentMethod,
      shippingAddress,
      city,
      notes,
      status: 'Pending',
      currency: 'USD',
      subtotal,
      shippingFee,
      total,
      items,
      createdAt: now,
      updatedAt: now
    };

    await upsertOrder(row);
    sendJson(res, 201, row);
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
};
