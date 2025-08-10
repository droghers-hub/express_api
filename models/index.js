const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config.json").development; // adjust if needed

// Create sequelize instance
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port
});

// Import models
const _Addresses = require("./addresses");
const _Banners = require("./banners");
const _Brands = require("./brands");
const _Categories = require("./categories");
const _Contacts = require("./contacts");
const _FailedJobs = require("./failedJobs");
const _Favorites = require("./favorites");
const _Handcarts = require("./handcarts");
const _Migrations = require("./migrations");
const _ModelHasPermissions = require("./modelHasPermissions");
const _ModelHasRoles = require("./modelHasRoles");
const _Notifications = require("./notifications");
const _OrderDetails = require("./orderDetails");
const _Orders = require("./orders");
const _PasswordResetTokens = require("./passwordResetTokens");
const _Payments = require("./payments");
const _Permissions = require("./permissions");
const _PersonalAccessTokens = require("./personalAccessTokens");
const _Postcodes = require("./postcodes");
const _Products = require("./products");
const _Ratings = require("./ratings");
const _RoleHasPermissions = require("./roleHasPermissions");
const _Roles = require("./roles");
const _Searches = require("./searches");
const _users = require("./users");
const _VerificationCodes = require("./verificationCodes");

// Initialize models
const Addresses = _Addresses(sequelize, DataTypes);
const Banners = _Banners(sequelize, DataTypes);
const Brands = _Brands(sequelize, DataTypes);
const Categories = _Categories(sequelize, DataTypes);
const Contacts = _Contacts(sequelize, DataTypes);
const FailedJobs = _FailedJobs(sequelize, DataTypes);
const Favorites = _Favorites(sequelize, DataTypes);
const Handcarts = _Handcarts(sequelize, DataTypes);
const Migrations = _Migrations(sequelize, DataTypes);
const ModelHasPermissions = _ModelHasPermissions(sequelize, DataTypes);
const ModelHasRoles = _ModelHasRoles(sequelize, DataTypes);
const Notifications = _Notifications(sequelize, DataTypes);
const OrderDetails = _OrderDetails(sequelize, DataTypes);
const Orders = _Orders(sequelize, DataTypes);
const PasswordResetTokens = _PasswordResetTokens(sequelize, DataTypes);
const Payments = _Payments(sequelize, DataTypes);
const Permissions = _Permissions(sequelize, DataTypes);
const PersonalAccessTokens = _PersonalAccessTokens(sequelize, DataTypes);
const Postcodes = _Postcodes(sequelize, DataTypes);
const Products = _Products(sequelize, DataTypes);
const Ratings = _Ratings(sequelize, DataTypes);
const RoleHasPermissions = _RoleHasPermissions(sequelize, DataTypes);
const Roles = _Roles(sequelize, DataTypes);
const Searches = _Searches(sequelize, DataTypes);
const users = _users(sequelize, DataTypes);
const VerificationCodes = _VerificationCodes(sequelize, DataTypes);

// Associations
Permissions.belongsToMany(Roles, { as: 'role_id_roles', through: RoleHasPermissions, foreignKey: "permission_id", otherKey: "role_id" });
Roles.belongsToMany(Permissions, { as: 'permission_id_permissions', through: RoleHasPermissions, foreignKey: "role_id", otherKey: "permission_id" });
Orders.belongsTo(Addresses, { as: "address", foreignKey: "address_id" });
Addresses.hasMany(Orders, { as: "orders", foreignKey: "address_id" });
Products.belongsTo(Brands, { as: "brand", foreignKey: "brand_id" });
Brands.hasMany(Products, { as: "products", foreignKey: "brand_id" });
Products.belongsTo(Categories, { as: "category", foreignKey: "category_id" });
Categories.hasMany(Products, { as: "products", foreignKey: "category_id" });
Brands.belongsTo(Contacts, { as: "contact", foreignKey: "contact_id" });
Contacts.hasMany(Brands, { as: "brands", foreignKey: "contact_id" });
OrderDetails.belongsTo(Orders, { as: "order", foreignKey: "order_id" });
Orders.hasMany(OrderDetails, { as: "order_details", foreignKey: "order_id" });
Payments.belongsTo(Orders, { as: "order", foreignKey: "order_id" });
Orders.hasMany(Payments, { as: "payments", foreignKey: "order_id" });
ModelHasPermissions.belongsTo(Permissions, { as: "permission", foreignKey: "permission_id" });
Permissions.hasMany(ModelHasPermissions, { as: "model_has_permissions", foreignKey: "permission_id" });
RoleHasPermissions.belongsTo(Permissions, { as: "permission", foreignKey: "permission_id" });
Permissions.hasMany(RoleHasPermissions, { as: "role_has_permissions", foreignKey: "permission_id" });
Addresses.belongsTo(Postcodes, { as: "postcode", foreignKey: "postcode_id" });
Postcodes.hasMany(Addresses, { as: "addresses", foreignKey: "postcode_id" });
Favorites.belongsTo(Products, { as: "product", foreignKey: "product_id" });
Products.hasMany(Favorites, { as: "favorites", foreignKey: "product_id" });
Handcarts.belongsTo(Products, { as: "product", foreignKey: "product_id" });
Products.hasMany(Handcarts, { as: "handcarts", foreignKey: "product_id" });
OrderDetails.belongsTo(Products, { as: "product", foreignKey: "product_id" });
Products.hasMany(OrderDetails, { as: "order_details", foreignKey: "product_id" });
Ratings.belongsTo(Products, { as: "product", foreignKey: "product_id" });
Products.hasMany(Ratings, { as: "ratings", foreignKey: "product_id" });
ModelHasRoles.belongsTo(Roles, { as: "role", foreignKey: "role_id" });
Roles.hasMany(ModelHasRoles, { as: "model_has_roles", foreignKey: "role_id" });
RoleHasPermissions.belongsTo(Roles, { as: "role", foreignKey: "role_id" });
Roles.hasMany(RoleHasPermissions, { as: "role_has_permissions", foreignKey: "role_id" });
Addresses.belongsTo(users, { as: "user", foreignKey: "user_id" });
users.hasMany(Addresses, { as: "addresses", foreignKey: "user_id" });
Favorites.belongsTo(users, { as: "user", foreignKey: "user_id" });
users.hasMany(Favorites, { as: "favorites", foreignKey: "user_id" });
Handcarts.belongsTo(users, { as: "user", foreignKey: "user_id" });
users.hasMany(Handcarts, { as: "handcarts", foreignKey: "user_id" });
Notifications.belongsTo(users, { as: "user", foreignKey: "user_id" });
users.hasMany(Notifications, { as: "notifications", foreignKey: "user_id" });
Orders.belongsTo(users, { as: "user", foreignKey: "user_id" });
users.hasMany(Orders, { as: "orders", foreignKey: "user_id" });
Ratings.belongsTo(users, { as: "user", foreignKey: "user_id" });
users.hasMany(Ratings, { as: "ratings", foreignKey: "user_id" });

// Export
module.exports = {
  sequelize,
  Sequelize,
  Addresses,
  Banners,
  Brands,
  Categories,
  Contacts,
  FailedJobs,
  Favorites,
  Handcarts,
  Migrations,
  ModelHasPermissions,
  ModelHasRoles,
  Notifications,
  OrderDetails,
  Orders,
  PasswordResetTokens,
  Payments,
  Permissions,
  PersonalAccessTokens,
  Postcodes,
  Products,
  Ratings,
  RoleHasPermissions,
  Roles,
  Searches,
  users,
  VerificationCodes
};
