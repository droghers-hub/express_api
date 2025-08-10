const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ModelHasPermissions', {
    permission_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    model_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    model_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'model_has_permissions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "permission_id" },
          { name: "model_id" },
          { name: "model_type" },
        ]
      },
      {
        name: "model_has_permissions_model_id_model_type_index",
        using: "BTREE",
        fields: [
          { name: "model_id" },
          { name: "model_type" },
        ]
      },
    ]
  });
};
