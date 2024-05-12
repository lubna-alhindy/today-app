import { statelessSessions } from "@keystone-6/core/session";
import { createAuth } from "@keystone-6/auth";
const nodemailer = require("nodemailer");

import { Envs } from "./src/_shared";

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  sessionData: "id email role",
  initFirstItem: {
    fields: ["name", "email", "password"],
  },
  magicAuthLink: {
    tokensValidForMins: 60,
    sendToken: async ({ itemId, identity, token, context }) => {
      console.log({ itemId, identity, token, context });

      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: Envs.MAILER_EMAIL,
          pass: Envs.MAILER_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: "<no-reply> | today@misraj.net",
        to: identity,
        subject: "Password Reset Link",
        text: `Here is your password reset link: http://localhost:3000/auth/reset-password?token=${token}`,
      });

      console.log("Message sent: %s", info.messageId);
    },
  },
  passwordResetLink: {
    tokensValidForMins: 60,
    sendToken: async ({ itemId, identity, token, context }) => {
      console.log({ itemId, identity, token, context });

      const transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
          user: Envs.MAILER_EMAIL,
          pass: Envs.MAILER_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: "<no-reply> | today@misraj.net",
        to: identity,
        subject: "Password Reset Link",
        text: `Here is your password reset link: http://localhost:3000/auth/reset-password?token=${token}`,
      });

      console.log("Message sent: %s", info.messageId);
    },
  },
});

const session = statelessSessions({
  maxAge: 60 * 60 * 24 * 30,
  secret: Envs.SESSION_SECRET,
});

export { withAuth, session };
