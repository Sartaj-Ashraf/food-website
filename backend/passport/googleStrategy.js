// passport/googleStrategy.js - Fixed for HTTPS issues
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import * as dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
      // Force HTTPS in production
      proxy: process.env.NODE_ENV === 'production'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update user info in case it changed
          user.name = profile.displayName;
          user.avatar = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Update existing user with Google ID
          user.googleId = profile.id;
          user.avatar = profile.photos[0]?.value;
          await user.save();
          return done(null, user);
        }

        // Create new user - first user becomes admin
        const isFirstUser = (await User.countDocuments()) === 0;

        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          role: isFirstUser ? "admin" : "user",
          isVerified: true,
          verified: new Date(),
        });

        console.log(`New user created: ${newUser.name} (${newUser.role})`);
        return done(null, newUser);
      } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});