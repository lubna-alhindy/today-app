import { config } from "@keystone-6/core";

import { extendExpressApp, extendGraphqlSchema } from "./src/_extension";
import { databaseConfig } from "./src/_shared";
import { withAuth, session } from "./auth";
import { lists } from "./schema";

export default withAuth(
  config({
    db: databaseConfig,

    lists,
    session,

    server: { extendExpressApp },
    extendGraphqlSchema,
  })
);
