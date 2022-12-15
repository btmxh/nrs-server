import { readCSV } from "https://deno.land/x/csv@v0.7.5/mod.ts";
import { readerFromStreamReader } from "https://deno.land/std@0.160.0/streams/mod.ts";

const pattern = new URLPattern({ pathname: "/list" });

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

    return new Response(`
        <html>
        <head>
          <title>NRS listing</title>
          <meta charset='utf-8'>
        </head>
        <body>
          <div id="container" style="height: 100%"></div>
          <script src="https://cdn.jsdelivr.net/npm/handsontable@11/dist/handsontable.full.min.js"></script>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable@11/dist/handsontable.full.min.css">
          <script src="https://cdn.jsdelivr.net/npm/handsontable@11/dist/handsontable.full.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/papaparse@5"></script>
          <script>
            setTimeout(() => {
              let cont = document.getElementById('container')
              cont.innerHtml = ''
              cont.className = ''
              Handsontable(cont, {
                data: ${JSON.stringify(data)},
                rowHeaders: true,
                colHeaders: ${JSON.stringify(headers)},
                columnSorting: true,
                dropdownMenu: true,
                filters: true,
                width: '100%',
                licenseKey: 'non-commercial-and-evaluation',
                manualColumnResize: true,
                persistentState: true,
              })
            }, 0);
          </script>
        </body>
      </html>
    `, {
      headers: {
        "content-type": "text/html"
      }
    });
  }

  return null;
}
