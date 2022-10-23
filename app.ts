import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
import { listRoute } from "./routes/list.ts"

serve(async (req) => {
  return await listRoute(req) ||
    new Response("Hello World!", {
      headers: { "content-type": "text/plain" },
    });
});