const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Addresses', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    postcode_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'postcodes',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull: false,
      defaultValue: "ACTIVE"
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    care_of: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    line_1: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    line_2: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM('HOME','OFFICE','OTHER'),
      allowNull: false,
      defaultValue: "OTHER"
    }
  }, {
    sequelize,
    tableName: 'addresses',
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
        name: "addresses_postcode_id_foreign",
        using: "BTREE",
        fields: [
          { name: "postcode_id" },
        ]
      },
      {
        name: "addresses_user_id_foreign",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
