import { Router } from "express";
import passport from "passport";

const router = Router();

import {
  googleCallback,
  googleFailure,
  logout,
  signUpWithSmsOtp,
  signInWithSmsOtp,
  signUpWithEmailOtp,
  signInWithEmailOtp,
  verifyEmailOtp,
  verifySmsOtp,
  checkAuth
} from "../controllers/authController.js";

// optional auth
router.get("/check-auth", checkAuth);
// SMS Authentication Routes
router.post('/signup-sms', signUpWithSmsOtp);
router.post('/signin-sms', signInWithSmsOtp);
router.post('/verify-sms-otp', verifySmsOtp);

// Email Authentication Routes
router.post('/signup-email', signUpWithEmailOtp);
router.post('/signin-email', signInWithEmailOtp);
router.post('/verify-email-otp', verifyEmailOtp);

// Logout Route
router.get("/logout", logout);

// Google OAuth routes
router.get('/google', (req, res, next) => {
  const redirectTo = req.query.redirectTo || '/';
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: redirectTo,
    prompt: "select_account",
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/google/failure",
    session: false,
  }),
  googleCallback
);

router.get("/google/failure", googleFailure);

export default router;