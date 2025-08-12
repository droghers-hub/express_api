const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Orders', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    address_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'addresses',
        key: 'id'
      }
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "orders_reference_unique"
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','INACTIVE','TRANSIT','HANDOVER','CANCELLED'),
      allowNull: false,
      defaultValue: "ACTIVE"
    }
  }, {
  timestamps: true,
underscored: true,
createdAt: 'created_at',
updatedAt: 'updated_at',
paranoid: true,
deletedAt: 'deleted_at',
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
        name: "orders_reference_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "reference" },
        ]
      },
      {
        name: "orders_user_id_foreign",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "orders_address_id_foreign",
        using: "BTREE",
        fields: [
          { name: "address_id" },
        ]
      },
    ]
  });
};
