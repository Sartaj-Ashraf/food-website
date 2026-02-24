import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import Razorpay from "razorpay";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

import "./passport/googleStrategy.js";

import authRouter from "./routes/authRouter.js";
import productRouter from "./routes/productRouter.js";
import contackQueriesRouter from "./routes/contackQueriesRouter.js";
import testimonailRouter from "./routes/testimonialRouter.js";
import comboRouter from "./routes/combosRouter.js";
import cartRouter from "./routes/cartRouter.js";
import addressRouter from "./routes/addressRouter.js";
import orderPaymentRouter from "./routes/orderPaymentRoutes.js";
import serviceAreaRouter from "./routes/ServiceAreaRouter.js";

import errorHandlerMiddleware from "./middleware/errorhandlerMiddleware.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

if (process.env.NODE_ENV === "production") {
  app.set('trust proxy', (ip) => true);
  app.use((req, res, next) => {
    if (req.secure) {
      return next();
    }
    res.redirect("https://" + req.headers.host + req.url);
  });
}

app.use(express.static(path.resolve(__dirname, "./public")));

// Middleware to parse normal JSON requests except webhook route
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/orderPayment/razorpay/webhook') {
    next(); // Skip json parsing for webhook to get raw body
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

// Raw body parser for Razorpay webhook to verify signature
app.use('/api/v1/orderPayment/razorpay/webhook',
  bodyParser.raw({ type: '*/*' })
);

app.use(cookieParser());

const allowedOrigins = process.env.NODE_ENV === "production" ? [
  "https://www.moonlightwalnutfudge.com",
  "https://moonlightwalnutfudge.com",
] : true;

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
}));

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || "google-auth-session-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Middleware to assign rawBody for webhook signature verification
app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/orderPayment/razorpay/webhook' && req.body) {
    req.rawBody = req.body.toString('utf8');
  }
  next();
});

// Body parsing for non-webhook requests with larger limits (redundant check but safe)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount routers
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/queries", contackQueriesRouter);
app.use("/api/v1/testimonials", testimonailRouter);
app.use("/api/v1/combos", comboRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/orderPayment", orderPaymentRouter);
app.use("/api/v1/serviceAreas", serviceAreaRouter);

// Error handling middleware
app.use(errorHandlerMiddleware);

// Razorpay instance export
export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const port = process.env.PORT || 5000;

try {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected successfully");

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
} catch (error) {
  console.error("Server startup error:", error);
  process.exit(1);
}
