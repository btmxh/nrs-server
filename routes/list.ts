import { readCSV } from "https://deno.land/x/csv@v0.7.5/mod.ts";
import { readerFromStreamReader } from "https://deno.land/std@0.160.0/streams/mod.ts";

const pattern = new URLPattern({ pathname: "/list" });

export async function listRoute(req: Request): Promise<Response | null> {
  const html = await Deno.readTextFile("routes/list.html");
  const match = pattern.exec(req.url);
  const url = new URL(req.url);
  const params = url.searchParams;
  const branch = params.get("branch") ?? "master";
  if (match) {
    const csvRequest = new Request(
      `https://github.com/ngoduyanh/nrs-impl-kt/releases/download/latest-${branch}/nrs.csv`
    );
    const csvResponse = await fetch(csvRequest);
    const csv = readCSV(
      readerFromStreamReader(csvResponse?.body?.getReader()!)
    );
    const headers: string[] = [];
    const data: string[][] = [];
    let isHeader = true;
    for await (const row of csv) {
      let rowData: string[] = [];
      if (isHeader) {
        rowData = headers;
        isHeader = false;
      } else {
        data.push(rowData);
      }
      for await (const col of row) {
        rowData.push(col);
      }
    }

    const source = html
      .replace("$DATA", JSON.stringify(data))
      .replace("$HEADERS", JSON.stringify(headers));
    return new Response(source, {
      headers: {
        "content-type": "text/html",
      },
    });
  }

  return null;
}
