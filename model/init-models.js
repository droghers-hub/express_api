var DataTypes = require("sequelize").DataTypes;
var _Addresses = require("./addresses");
var _Banners = require("./banners");
var _Brands = require("./brands");
var _Categories = require("./categories");
var _Contacts = require("./contacts");
var _FailedJobs = require("./failedJobs");
var _Favorites = require("./favorites");
var _Handcarts = require("./handcarts");
var _Migrations = require("./migrations");
var _ModelHasPermissions = require("./modelHasPermissions");
var _ModelHasRoles = require("./modelHasRoles");
var _Notifications = require("./notifications");
var _OrderDetails = require("./orderDetails");
var _Orders = require("./orders");
var _PasswordResetTokens = require("./passwordResetTokens");
var _Payments = require("./payments");
var _Permissions = require("./permissions");
var _PersonalAccessTokens = require("./personalAccessTokens");
var _Postcodes = require("./postcodes");
var _Products = require("./products");
var _Ratings = require("./ratings");
var _RoleHasPermissions = require("./roleHasPermissions");
var _Roles = require("./roles");
var _Searches = require("./searches");
var _Users = require("./users");
var _VerificationCodes = require("./verificationCodes");

function initModels(sequelize) {
  var Addresses = _Addresses(sequelize, DataTypes);
  var Banners = _Banners(sequelize, DataTypes);
  var Brands = _Brands(sequelize, DataTypes);
  var Categories = _Categories(sequelize, DataTypes);
  var Contacts = _Contacts(sequelize, DataTypes);
  var FailedJobs = _FailedJobs(sequelize, DataTypes);
  var Favorites = _Favorites(sequelize, DataTypes);
  var Handcarts = _Handcarts(sequelize, DataTypes);
  var Migrations = _Migrations(sequelize, DataTypes);
  var ModelHasPermissions = _ModelHasPermissions(sequelize, DataTypes);
  var ModelHasRoles = _ModelHasRoles(sequelize, DataTypes);
  var Notifications = _Notifications(sequelize, DataTypes);
  var OrderDetails = _OrderDetails(sequelize, DataTypes);
  var Orders = _Orders(sequelize, DataTypes);
  var PasswordResetTokens = _PasswordResetTokens(sequelize, DataTypes);
  var Payments = _Payments(sequelize, DataTypes);
  var Permissions = _Permissions(sequelize, DataTypes);
  var PersonalAccessTokens = _PersonalAccessTokens(sequelize, DataTypes);
  var Postcodes = _Postcodes(sequelize, DataTypes);
  var Products = _Products(sequelize, DataTypes);
  var Ratings = _Ratings(sequelize, DataTypes);
  var RoleHasPermissions = _RoleHasPermissions(sequelize, DataTypes);
  var Roles = _Roles(sequelize, DataTypes);
  var Searches = _Searches(sequelize, DataTypes);
  var Users = _Users(sequelize, DataTypes);
  var VerificationCodes = _VerificationCodes(sequelize, DataTypes);

  Permissions.belongsToMany(Roles, { as: 'role_id_roles', through: RoleHasPermissions, foreignKey: "permission_id", otherKey: "role_id" });
  Roles.belongsToMany(Permissions, { as: 'permission_id_permissions', through: RoleHasPermissions, foreignKey: "role_id", otherKey: "permission_id" });
  Orders.belongsTo(Addresses, { as: "address", foreignKey: "address_id"});
  Addresses.hasMany(Orders, { as: "orders", foreignKey: "address_id"});
  Products.belongsTo(Brands, { as: "brand", foreignKey: "brand_id"});
  Brands.hasMany(Products, { as: "products", foreignKey: "brand_id"});
  Products.belongsTo(Categories, { as: "category", foreignKey: "category_id"});
  Categories.hasMany(Products, { as: "products", foreignKey: "category_id"});
  Brands.belongsTo(Contacts, { as: "contact", foreignKey: "contact_id"});
  Contacts.hasMany(Brands, { as: "brands", foreignKey: "contact_id"});
  OrderDetails.belongsTo(Orders, { as: "order", foreignKey: "order_id"});
  Orders.hasMany(OrderDetails, { as: "order_details", foreignKey: "order_id"});
  Payments.belongsTo(Orders, { as: "order", foreignKey: "order_id"});
  Orders.hasMany(Payments, { as: "payments", foreignKey: "order_id"});
  ModelHasPermissions.belongsTo(Permissions, { as: "permission", foreignKey: "permission_id"});
  Permissions.hasMany(ModelHasPermissions, { as: "model_has_permissions", foreignKey: "permission_id"});
  RoleHasPermissions.belongsTo(Permissions, { as: "permission", foreignKey: "permission_id"});
  Permissions.hasMany(RoleHasPermissions, { as: "role_has_permissions", foreignKey: "permission_id"});
  Addresses.belongsTo(Postcodes, { as: "postcode", foreignKey: "postcode_id"});
  Postcodes.hasMany(Addresses, { as: "addresses", foreignKey: "postcode_id"});
  Favorites.belongsTo(Products, { as: "product", foreignKey: "product_id"});
  Products.hasMany(Favorites, { as: "favorites", foreignKey: "product_id"});
  Handcarts.belongsTo(Products, { as: "product", foreignKey: "product_id"});
  Products.hasMany(Handcarts, { as: "handcarts", foreignKey: "product_id"});
  OrderDetails.belongsTo(Products, { as: "product", foreignKey: "product_id"});
  Products.hasMany(OrderDetails, { as: "order_details", foreignKey: "product_id"});
  Ratings.belongsTo(Products, { as: "product", foreignKey: "product_id"});
  Products.hasMany(Ratings, { as: "ratings", foreignKey: "product_id"});
  ModelHasRoles.belongsTo(Roles, { as: "role", foreignKey: "role_id"});
  Roles.hasMany(ModelHasRoles, { as: "model_has_roles", foreignKey: "role_id"});
  RoleHasPermissions.belongsTo(Roles, { as: "role", foreignKey: "role_id"});
  Roles.hasMany(RoleHasPermissions, { as: "role_has_permissions", foreignKey: "role_id"});
  Addresses.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Addresses, { as: "addresses", foreignKey: "user_id"});
  Favorites.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Favorites, { as: "favorites", foreignKey: "user_id"});
  Handcarts.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Handcarts, { as: "handcarts", foreignKey: "user_id"});
  Notifications.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Notifications, { as: "notifications", foreignKey: "user_id"});
  Orders.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Orders, { as: "orders", foreignKey: "user_id"});
  Ratings.belongsTo(Users, { as: "user", foreignKey: "user_id"});
  Users.hasMany(Ratings, { as: "ratings", foreignKey: "user_id"});

  return {
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
    Users,
    VerificationCodes,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
