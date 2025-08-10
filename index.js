require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
// const client = require('prom-client');

// // const userRoutes = require("./routes/user.routes");
// // const productRoutes = require("./routes/product.routes");
// // const cartItemRoutes = require("./routes/cart_item.routes");
// // const favoritesRoutes = require("./routes/favorites.routes");
// // const addressRoutes = require("./routes/address.routes");
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

const PORT = process.env.PORT || 3000;

// // Collect default metrics
// client.collectDefaultMetrics();

// // Define histogram for HTTP request durations
// const httpRequestDurationMicroseconds = new client.Histogram({
//   name: 'http_request_duration_seconds',
//   help: 'Duration of HTTP requests in seconds',
//   labelNames: ['method', 'route', 'status_code'],
// });

// // Middleware to measure response time (excluding /metrics)
// app.use((req, res, next) => {
//   if (req.path === '/metrics') return next(); // skip Prometheus scraping

//   const end = httpRequestDurationMicroseconds.startTimer();

//   res.on('finish', () => {
//     end({
//       method: req.method,
//       route: req.route?.path || req.path,
//       status_code: res.statusCode,
//     });
//   });

//   next();
// });

// // Expose metrics for Prometheus
// app.get('/metrics', async (req, res) => {
//   res.set('Content-Type', client.register.contentType);
//   res.end(await client.register.metrics());
// });

// Test route (use it at least once to trigger metric)
app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

// // Route registrations
// app.use("/api", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/cart", cartItemRoutes);
// app.use("/api/favorites", favoritesRoutes);
// app.use("/api/address", addressRoutes);
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is up and running on port ${PORT}!`);
});
