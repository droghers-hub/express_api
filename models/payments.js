const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Payments', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    mode: {
      type: DataTypes.ENUM('CASH'),
      allowNull: false,
      defaultValue: "CASH"
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "payments_reference_unique"
    },
    refunded_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull: false,
      defaultValue: "ACTIVE"
    }
  }, {
    sequelize,
    tableName: 'payments',
    timestamps: false,
    paranoid: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "payments_reference_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "reference" },
        ]
      },
      {
        name: "payments_order_id_foreign",
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      },
    ]
  });
};
