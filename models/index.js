const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/config.json").development; // adjust if needed
 
// Create sequelize instance
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  port: config.port
});
 
// Import models
const _addresses = require("./addresses");
const _banners = require("./banners");
const _brands = require("./brands");
const _categories = require("./categories");
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
const _postcodes = require("./postcodes");
const _products = require("./products");
const _Ratings = require("./ratings");
const _RoleHasPermissions = require("./roleHasPermissions");
const _Roles = require("./roles");
const _Searches = require("./searches");
const _users = require("./users");
const _VerificationCodes = require("./verificationCodes");
 
// Initialize models
const addresses = _addresses(sequelize, DataTypes);
const banners = _banners(sequelize, DataTypes);
const brands = _brands(sequelize, DataTypes);
const categories = _categories(sequelize, DataTypes);
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
const postcodes = _postcodes(sequelize, DataTypes);
const products = _products(sequelize, DataTypes);
const Ratings = _Ratings(sequelize, DataTypes);
const RoleHasPermissions = _RoleHasPermissions(sequelize, DataTypes);
const Roles = _Roles(sequelize, DataTypes);
const Searches = _Searches(sequelize, DataTypes);
const users = _users(sequelize, DataTypes);
const VerificationCodes = _VerificationCodes(sequelize, DataTypes);
 
// Associations
Permissions.belongsToMany(Roles, { as: 'role_id_roles', through: RoleHasPermissions, foreignKey: "permission_id", otherKey: "role_id" });
Roles.belongsToMany(Permissions, { as: 'permission_id_permissions', through: RoleHasPermissions, foreignKey: "role_id", otherKey: "permission_id" });
Orders.belongsTo(addresses, { as: "address", foreignKey: "address_id" });
addresses.hasMany(Orders, { as: "orders", foreignKey: "address_id" });
products.belongsTo(brands, { as: "brand", foreignKey: "brand_id" });
brands.hasMany(products, { as: "products", foreignKey: "brand_id" });
products.belongsTo(categories, { as: "category", foreignKey: "category_id" });
categories.hasMany(products, { as: "products", foreignKey: "category_id" });
brands.belongsTo(Contacts, { as: "contact", foreignKey: "contact_id" });
Contacts.hasMany(brands, { as: "brands", foreignKey: "contact_id" });
OrderDetails.belongsTo(Orders, { as: "order", foreignKey: "order_id" });
Orders.hasMany(OrderDetails, { as: "order_details", foreignKey: "order_id" });
Payments.belongsTo(Orders, { as: "order", foreignKey: "order_id" });
Orders.hasMany(Payments, { as: "payments", foreignKey: "order_id" });
ModelHasPermissions.belongsTo(Permissions, { as: "permission", foreignKey: "permission_id" });
Permissions.hasMany(ModelHasPermissions, { as: "model_has_permissions", foreignKey: "permission_id" });
RoleHasPermissions.belongsTo(Permissions, { as: "permission", foreignKey: "permission_id" });
Permissions.hasMany(RoleHasPermissions, { as: "role_has_permissions", foreignKey: "permission_id" });
addresses.belongsTo(postcodes, { as: "postcode", foreignKey: "postcode_id" });
postcodes.hasMany(addresses, { as: "addresses", foreignKey: "postcode_id" });
Favorites.belongsTo(products, { as: "product", foreignKey: "product_id" });
products.hasMany(Favorites, { as: "favorites", foreignKey: "product_id" });
Handcarts.belongsTo(products, { as: "product", foreignKey: "product_id" });
products.hasMany(Handcarts, { as: "handcarts", foreignKey: "product_id" });
OrderDetails.belongsTo(products, { as: "product", foreignKey: "product_id" });
products.hasMany(OrderDetails, { as: "order_details", foreignKey: "product_id" });
Ratings.belongsTo(products, { as: "product", foreignKey: "product_id" });
products.hasMany(Ratings, { as: "ratings", foreignKey: "product_id" });
ModelHasRoles.belongsTo(Roles, { as: "role", foreignKey: "role_id" });
Roles.hasMany(ModelHasRoles, { as: "model_has_roles", foreignKey: "role_id" });
RoleHasPermissions.belongsTo(Roles, { as: "role", foreignKey: "role_id" });
Roles.hasMany(RoleHasPermissions, { as: "role_has_permissions", foreignKey: "role_id" });
addresses.belongsTo(users, { as: "user", foreignKey: "user_id" });
users.hasMany(addresses, { as: "addresses", foreignKey: "user_id" });
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

addresses.belongsTo(users, { foreignKey: "user_id", as: "userAddress" });

products.belongsTo(brands, { foreignKey: "brand_id" });
products.belongsTo(categories, { foreignKey: "category_id" });



// Export
module.exports = {
  sequelize,
  Sequelize,
  addresses,
  banners,
  brands,
  categories,
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
  postcodes,
  products,
  Ratings,
  RoleHasPermissions,
  Roles,
  Searches,
  users,
  VerificationCodes
};
