import { DatabaseConfig } from "@keystone-6/core/types";

import { Envs } from "../envs";

export const databaseConfig: DatabaseConfig<any> = {
  provider: "postgresql",
  url: Envs.DATABASE_URL,
  shadowDatabaseUrl: Envs.SHADOW_DATABASE_URL,
};
