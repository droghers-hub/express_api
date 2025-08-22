const { Orders, OrderDetails, users, addresses, postcodes, products, Brands, categories } = require("../models");

exports.getAllActiveOrders = async (req, res) => {
  try {
    const orders = await Orders.findAll({
      where: {
        status: 'ACTIVE'
      },
      include: [
        {
          model: users,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'photo', 'points', 'status']
        },
        {
          model: addresses,
          as: 'address',
          include: [
            {
              model: postcodes,
              as: 'postcode',
              attributes: ['id', 'code', 'post_office', 'city', 'district', 'state', 'country', 'delivery_charge']
            }
          ]
        },
        {
          model: OrderDetails,
          as: 'order_details',
          where: {
            status: 'ACTIVE'
          },
          required: false,
          include: [
            {
              model: products,
              as: 'product',
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
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedOrders = orders.map(order => {
      const orderData = order.toJSON();
      
      let totalAmount = 0;
      let totalItems = 0;
      
      if (orderData.order_details && orderData.order_details.length > 0) {
        orderData.order_details.forEach(detail => {
          totalAmount += parseFloat(detail.deal_price) * detail.quantity;
          totalItems += detail.quantity;
        });
      }

      return {
        id: orderData.id,
        reference: orderData.reference,
        status: orderData.status,
        delivered_at: orderData.delivered_at,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        total_amount: totalAmount.toFixed(2),
        total_items: totalItems,
        delivery_charge: orderData.address?.postcode?.delivery_charge || 0,
        grand_total: (totalAmount + parseFloat(orderData.address?.postcode?.delivery_charge || 0)).toFixed(2),
        user: orderData.user,
        address: {
          id: orderData.address?.id,
          name: orderData.address?.name,
          care_of: orderData.address?.care_of,
          phone: orderData.address?.phone,
          line_1: orderData.address?.line_1,
          line_2: orderData.address?.line_2,
          type: orderData.address?.type,
          postcode: orderData.address?.postcode
        },
        order_details: orderData.order_details
      };
    });

    return res.status(200).json({
      success: true,
      message: "Active orders retrieved successfully",
      data: formattedOrders,
      total_orders: formattedOrders.length
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: err.message
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Orders.findOne({
      where: {
        id: orderId,
        status: 'ACTIVE'
      },
      include: [
        {
          model: users,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'photo', 'points', 'status']
        },
        {
          model: addresses,
          as: 'address',
          include: [
            {
              model: postcodes,
              as: 'postcode',
              attributes: ['id', 'code', 'post_office', 'city', 'district', 'state', 'country', 'delivery_charge']
            }
          ]
        },
        {
          model: OrderDetails,
          as: 'order_details',
          where: {
            status: 'ACTIVE'
          },
          required: false,
          include: [
            {
              model: products,
              as: 'product',
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

    const orderData = order.toJSON();
    
    let totalAmount = 0;
    let totalItems = 0;
    
    if (orderData.order_details && orderData.order_details.length > 0) {
      orderData.order_details.forEach(detail => {
        totalAmount += parseFloat(detail.deal_price) * detail.quantity;
        totalItems += detail.quantity;
      });
    }

    const formattedOrder = {
      id: orderData.id,
      reference: orderData.reference,
      status: orderData.status,
      delivered_at: orderData.delivered_at,
      created_at: orderData.created_at,
      updated_at: orderData.updated_at,
      total_amount: totalAmount.toFixed(2),
      total_items: totalItems,
      delivery_charge: orderData.address?.postcode?.delivery_charge || 0,
      grand_total: (totalAmount + parseFloat(orderData.address?.postcode?.delivery_charge || 0)).toFixed(2),
      user: orderData.user,
      address: {
        id: orderData.address?.id,
        name: orderData.address?.name,
        care_of: orderData.address?.care_of,
        phone: orderData.address?.phone,
        line_1: orderData.address?.line_1,
        line_2: orderData.address?.line_2,
        type: orderData.address?.type,
        postcode: orderData.address?.postcode
      },
      order_details: orderData.order_details
    };

    return res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: formattedOrder
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
      error: err.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'TRANSIT', 'HANDOVER', 'CANCELLED'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (ACTIVE, INACTIVE, TRANSIT, HANDOVER, CANCELLED)"
      });
    }

    const order = await Orders.findByPk(orderId);

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

    await order.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: {
        id: order.id,
        reference: order.reference,
        status: order.status,
        delivered_at: order.delivered_at
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: err.message
    });
  }
};

exports.markAllOrdersInTransit = async (req, res) => {
  try {
    const result = await Orders.update(
      { status: 'TRANSIT' },
      {
        where: {
          status: 'ACTIVE'
        }
      }
    );

    const updatedCount = result[0];

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No active orders found to update"
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully marked ${updatedCount} orders as in transit`,
      data: {
        updated_orders_count: updatedCount
      }
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to update orders to transit status",
      error: err.message
    });
  }
};