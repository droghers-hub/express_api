const { Orders, OrderDetails, sequelize, users, addresses, products, Brands, categories, postcodes } = require("../models");

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

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: "Order ID is required" 
      });
    }

    const order = await Orders.findOne({
      where: { 
        id,
        ...(user_id && { user_id })
      },
      include: [
        {
          model: addresses,
          as: 'address',
          include: [
            {
              model: postcodes,
              as: 'postcode',
              attributes: ['id', 'code', 'post_office']
            }
          ]
        },
        {
          model: users,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: OrderDetails,
          as: 'order_details',
          where: { status: 'ACTIVE' },
          required: false,
          include: [
            {
              model: products,
              as: 'product',
              attributes: ['id', 'name', 'photo', 'unit'],
              include: [
                {
                  model: Brands,
                  as: 'brand',
                  attributes: ['id', 'name']
                },
                {
                  model: categories,
                  as: 'category',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    const subtotal = order.order_details.reduce((sum, item) => {
      return sum + (Number(item.deal_price) * item.quantity);
    }, 0);

    const deliveryFee = 25;
    const taxRate = 0.05;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + deliveryFee + taxAmount;

    const estimatedDelivery = new Date(order.created_at);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);

    const responseOrder = {
      id: order.id,
      reference: order.reference,
      status: order.status,
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      tax_amount: taxAmount,
      subtotal: subtotal,
      payment_method: 'COD',
      created_at: order.created_at,
      updated_at: order.updated_at,
      delivered_at: order.delivered_at,
      estimated_delivery: estimatedDelivery.toISOString(),
      items: order.order_details.map(detail => ({
        id: detail.id,
        product_id: detail.product_id,
        quantity: detail.quantity,
        price: Number(detail.deal_price),
        line_total: Number(detail.deal_price) * detail.quantity,
        product: {
          id: detail.product.id,
          title: detail.product.name,
          brand: detail.product.brand?.name || 'Unknown',
          category: detail.product.category?.name || 'Unknown',
          image: detail.product.photo,
          unit: detail.product.unit
        }
      })),
      address: {
        id: order.address.id,
        name: order.address.name,
        care_of: order.address.care_of,
        phone: order.address.phone,
        line_1: order.address.line_1,
        line_2: order.address.line_2,
        postcode_id: order.address.postcode_id,
        postcode: order.address.postcode?.code || null,
        post_office: order.address.postcode?.post_office || null
      },
      user: {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone
      }
    };

    return res.status(200).json({
      success: true,
      message: "Order details retrieved successfully",
      order: responseOrder
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order details",
      error: error.message
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      sort_by = 'created_at', 
      sort_order = 'DESC' 
    } = req.query;

    if (!user_id) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const user = await users.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = { user_id };
    
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: orders } = await Orders.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: addresses,
          as: 'address',
          attributes: ['id', 'name', 'line_1', 'line_2']
        },
        {
          model: OrderDetails,
          as: 'order_details',
          where: { status: 'ACTIVE' },
          required: false,
          include: [
            {
              model: products,
              as: 'product',
              attributes: ['id', 'name', 'photo']
            }
          ]
        }
      ],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    });

    const ordersWithTotals = orders.map(order => {
      const subtotal = order.order_details.reduce((sum, item) => {
        return sum + (Number(item.deal_price) * item.quantity);
      }, 0);

      const deliveryFee = 25;
      const taxRate = 0.05;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + deliveryFee + taxAmount;

      const itemCount = order.order_details.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: order.id,
        reference: order.reference,
        status: order.status,
        total_amount: totalAmount,
        subtotal: subtotal,
        item_count: itemCount,
        created_at: order.created_at,
        updated_at: order.updated_at,
        delivered_at: order.delivered_at,
        address: {
          id: order.address.id,
          name: order.address.name,
          line_1: order.address.line_1,
          line_2: order.address.line_2
        },
        items_preview: order.order_details.slice(0, 3).map(detail => ({
          id: detail.id,
          product_id: detail.product_id,
          quantity: detail.quantity,
          product: {
            id: detail.product.id,
            title: detail.product.name,
            brand: 'Unknown',
            image: detail.product.photo
          }
        }))
      };
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders: ordersWithTotals,
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_orders: count,
          per_page: parseInt(limit),
          has_next: parseInt(page) < totalPages,
          has_prev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ 
        success: false, 
        message: "Order ID and status are required" 
      });
    }

    const validStatuses = ['ACTIVE', 'INACTIVE', 'TRANSIT', 'HANDOVER', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Valid statuses: ${validStatuses.join(', ')}` 
      });
    }

    const order = await Orders.findByPk(id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    const updateData = { status };
    
    if (status === 'HANDOVER') {
      updateData.delivered_at = new Date();
    }

    const [updatedCount] = await Orders.update(updateData, {
      where: { id }
    });

    if (updatedCount === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Failed to update order status" 
      });
    }

    const updatedOrder = await Orders.findByPk(id);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: {
        id: updatedOrder.id,
        reference: updatedOrder.reference,
        status: updatedOrder.status,
        delivered_at: updatedOrder.delivered_at,
        updated_at: updatedOrder.updated_at
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};