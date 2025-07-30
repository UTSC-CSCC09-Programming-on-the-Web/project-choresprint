import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma"; // adjust path if needed

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // First, check if user exists
        let user = await prisma.user.findUnique({
          where: {
            email: profile.emails?.[0].value,
          },
        });

        // If user doesn't exist, create a new one
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0].value!,
              name: profile.displayName,
              provider: "google",
              providerId: profile.id,
              avatarUrl: profile.photos?.[0].value || null,
            },
          });
        }

        done(null, user);
      } catch (err) {
        done(err, undefined);
      }
    },
  ),
);

export default passport;
