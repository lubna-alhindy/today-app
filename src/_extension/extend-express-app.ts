import { KeystoneContext } from "@keystone-6/core/types";
import { Express } from "express";

export function extendExpressApp(
  app: Express,
  commonContext: KeystoneContext<any>
) {
  app.get("/rest/check-health", async (req, res) => {
    return res.json({
      message: "Server is up!",
    });
  });
}
