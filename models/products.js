const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Products', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    brand_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'brands',
        key: 'id'
      }
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    variant: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    purchase_price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    retail_price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    current_price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull: false,
      defaultValue: "ACTIVE"
    },
    barcode: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: "products_barcode_unique"
    }
  }, {
    sequelize,
    tableName: 'products',
    timestamps: true,
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
        name: "products_barcode_unique",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "barcode" },
        ]
      },
      {
        name: "products_brand_id_foreign",
        using: "BTREE",
        fields: [
          { name: "brand_id" },
        ]
      },
      {
        name: "products_category_id_foreign",
        using: "BTREE",
        fields: [
          { name: "category_id" },
        ]
      },
    ]
  });
};
