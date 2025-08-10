require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express(); 
// const client = require('prom-client');
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/UserRoute");
const bancatbraRoutes = require("./routes/bancatbra.routes");
const productRoutes = require("./routes/ProductRoute");
// // const cartItemRoutes = require("./routes/cart_item.routes");
// // const favoritesRoutes = require("./routes/favorites.routes");
const addressRoutes = require("./routes/AddressRoute");
// // const orderRoutes = require("./routes/order.routes");
// // const categoryRoutes = require("./routes/category.routes");
// // const priceroutes = require("./routes/totalprice.routes");
// // const locationRoutes = require('./routes/location.routes');
// // const medicineRoutes = require("./routes/medicine.routes");
// // const imageRoutes = require('./routes/image.routes');
// // const bannerRoutes = require("./routes/banners.routes");
// // const searchRoutes = require("./routes/search.routes");
// // const weatherRoutes = require("./routes/weather.routes");
// // const mobileRoutes = require("./routes/mobilediscount.routes");


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true })); // For form data

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// // Route registrations
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/bancatbra", bancatbraRoutes);
app.use("/api/products", productRoutes);
// app.use("/api/cart", cartItemRoutes);
// app.use("/api/favorites", favoritesRoutes);
app.use("/api/address", addressRoutes);
// app.use("/api/order", orderRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api", priceroutes);
// app.use("/api", locationRoutes);
// app.use("/api/medicine", medicineRoutes);
// app.use('/api/images', imageRoutes);
// app.use("/api/banners", bannerRoutes);
// app.use("/api/search", searchRoutes);
// app.use("/api/weather", weatherRoutes);
// app.use("/api/mobile", mobileRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is up and running on port ${PORT}!`);
});
