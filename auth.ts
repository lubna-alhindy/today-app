import { statelessSessions } from "@keystone-6/core/session";
import { createAuth } from "@keystone-6/auth";

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
    },
  },
  passwordResetLink: {
    tokensValidForMins: 60,
    sendToken: async ({ itemId, identity, token, context }) => {
      console.log({ itemId, identity, token, context });
    },
  },
});

const session = statelessSessions({
  maxAge: 60 * 60 * 24 * 30,
  secret: Envs.SESSION_SECRET,
});

export { withAuth, session };
