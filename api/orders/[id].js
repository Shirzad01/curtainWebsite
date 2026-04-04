const { requireAdminAuth } = require('../_lib/admin-auth');
const {
  deleteOrder,
  getOrders,
  handleOptions,
  readJson,
  sendJson,
  upsertOrder
} = require('../_lib/store');

module.exports = async (req, res) => {
  if (handleOptions(req, res)) return;
  if (!requireAdminAuth(req, res)) return;

  const { id } = req.query || {};
  if (!id) {
    sendJson(res, 400, { error: 'Order id is required' });
    return;
  }

  if (req.method === 'PUT') {
    const payload = await readJson(req);
    const orders = await getOrders();
    const existing = orders.find((item) => item.id === id);
    if (!existing) {
      sendJson(res, 404, { error: 'Order not found' });
      return;
    }

    const updated = {
      ...existing,
      ...payload,
      id,
      updatedAt: new Date().toISOString()
    };

    await upsertOrder(updated);
    sendJson(res, 200, updated);
    return;
  }

  if (req.method === 'DELETE') {
    await deleteOrder(id);
    sendJson(res, 200, { success: true });
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
};
