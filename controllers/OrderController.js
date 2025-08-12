// controllers/OrderController.js
const { Orders, OrderDetails, sequelize, users, addresses } = require("../models");

function generateOrderRef() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const hhmmss = `${String(d.getHours()).padStart(2,"0")}${String(d.getMinutes()).padStart(2,"0")}${String(d.getSeconds()).padStart(2,"0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${ymd}${hhmmss}-${rand}`;
}

exports.placeOrder = async (req, res) => {
  const { user_id, address_id, items } = req.body || {};
  if (!user_id || !address_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "user_id, address_id and items[] are required" });
  }
  for (const it of items) {
    if (!it.product_id || !Number.isInteger(it.quantity) || it.quantity <= 0 || it.price == null) {
      return res.status(400).json({ success: false, message: "Each item needs product_id, quantity (int > 0), and price" });
    }
  }

  let t;
  try {
    // ✅ minimal FK guards
    const user = await users.findByPk(user_id);
    if (!user) return res.status(400).json({ success: false, message: "Invalid user_id" });

    const addr = await addresses.findOne({ where: { id: address_id, user_id } });
    if (!addr) return res.status(400).json({ success: false, message: "Invalid address_id for this user" });

    t = await sequelize.transaction();

    const order = await Orders.create({
      user_id,
      address_id,
      reference: generateOrderRef(),
      delivered_at: null,
      status: "ACTIVE",
    }, { transaction: t });

    const payload = items.map(it => ({
      order_id: order.id,
      product_id: it.product_id,
      quantity: it.quantity,
      purchase_price: it.price,
      retail_price: it.price,
      deal_price: it.price,
      status: "ACTIVE",
    }));
    const details = await OrderDetails.bulkCreate(payload, { transaction: t, returning: true });

    await t.commit();

    const lineItems = details.map(d => ({
      id: d.id,
      product_id: d.product_id,
      quantity: d.quantity,
      price: Number(d.deal_price),
      line_total: Number(d.deal_price) * d.quantity,
    }));
    const total = lineItems.reduce((s, li) => s + li.line_total, 0);
    const address = await addresses.findByPk(order.address_id, { raw: true });

    return res.status(201).json({
      success: true,
      message: "Order placed",
      order: {
        id: order.id,
        reference: order.reference,
        user_id: order.user_id,
        address,
        status: order.status,
      },
      items: lineItems,
      total,
    });
  } catch (err) {
    if (t) { try { await t.rollback(); } catch (_) {} }
    return res.status(500).json({ success: false, message: "Failed to place order", error: err.message });
  }
};
