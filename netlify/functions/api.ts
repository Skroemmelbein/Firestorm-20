import serverless from "serverless-http";

import { createServer } from "../../server";

export const handler = async (event: any, context: any) => {
  const app = await createServer();
  return serverless(app)(event, context);
};
