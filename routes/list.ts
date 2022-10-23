import { compileFile } from "https://deno.land/x/pug@v0.1.3/mod.ts";
import { readCSV } from "https://deno.land/x/csv@v0.7.5/mod.ts";
import { readerFromStreamReader } from "https://deno.land/std@0.160.0/streams/mod.ts";

const pattern = new URLPattern({ pathname: "/list" });
const template = compileFile('views/list/index.pug');

export async function listRoute(req: Request): Promise<Response | null> {
  const match = pattern.exec(req.url);
  if(match) {
    const csvRequest = new Request("https://github.com/ngoduyanh/nrs-impl-kt/releases/download/latest-master/nrs.csv");
    const csvResponse = await fetch(csvRequest);
    const csv = readCSV(readerFromStreamReader(csvResponse?.body?.getReader()!));
    const headers: string[] = [];
    const data: string[][] = [];
    let isHeader = true;
    for await (const row of csv) {
      let rowData: string[] = [];
      if(isHeader) {
        rowData = headers;
        isHeader = false;
      } else {
        data.push(rowData);
      }
      for await (const col of row) {
        rowData.push(col);
      }
    }
    
    const html = template({
      fields: headers,
      data: data
    });

    return new Response(html, {
      headers: {
        "content-type": "text/html charset=utf-8"
      }
    });
  }

  return null;
}