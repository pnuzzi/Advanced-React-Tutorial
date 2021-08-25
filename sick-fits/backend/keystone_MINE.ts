import "dotenv/config";
import { config, createSchema, list } from "@keystone-next/keystone/schema";
import { createAuth } from "@keystone-next/auth";
import { statelessSessions } from "@keystone-next/keystone/session";
import { text, password, checkbox } from "@keystone-next/fields";
import { User } from "./schemas/User";

const databaseURL = process.env.DATABASE_URL;

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360,
  secret: process.env.COOKIE_SECRET,
};

const session = statelessSessions(sessionConfig, {
  User: "id name email",
});

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  sessionData: "id name email",
  initFirstItem: {
    fields: ["name", "email", "password", "isAdmin"],
    itemData: { isAdmin: true },
    skipKeystoneWelcome: false,
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: "mongoose",
      url: databaseURL,
    },
    lists: createSchema({
      User: list({
        fields: {
          name: text(),
          email: text({ isUnique: true }),
          password: password(),
          isAdmin: checkbox(),
        },
      }),
    }),
    ui: {
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session,
  })
);
