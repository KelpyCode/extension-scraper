import puppeteer from "npm:puppeteer";
import { categoryUrls } from "./data.ts";

const browser = await puppeteer.launch();

interface Extension {
  name: string;
  description: string;
  category?: string;
}

setInterval(() => {}, 10000);

const categoryExtensions: Record<string, Extension[]> = {};

const categoryPromises = [];

for (const [category, url] of categoryUrls) {
  console.log(category, url);

  categoryPromises.push(
    // deno-lint-ignore no-async-promise-executor
    new Promise(async (resolve) => {
      const page = await browser.newPage();
      await page.goto(url);
      console.log("Started", category);

      const tbody = await page.$("tbody");


      const extensions = await tbody?.evaluate(async (tbody) => {
        const extensions2 = []
        const trs = tbody.querySelectorAll("tr");
        for(const tr of trs) {
          const tds = tr.querySelectorAll("td");
          const name = tds[0]?.textContent?.replace("Dateiendung", "")?.trim() ?? '';
          const description = tds[1]?.textContent ?? '';
          extensions2.push({ name, description });
        }
        return extensions2
      })

      categoryExtensions[category] = extensions!

      // for (const tr of tbody) {
      //   promises.push(
      //     tr.$$("td").then(async (tds) => {
      //       const name = (
      //         (await tds[0].evaluate((td) => td.textContent)) as string
      //       )
      //         .replace("Dateiendung", "")
      //         .trim();
      //       const description = await tds[1].evaluate((td) => td.textContent);

      //       if (!categoryExtensions[category]) {
      //         categoryExtensions[category] = [];
      //       }
      //       categoryExtensions[category].push({ name, description });
      //     })
      //   );
      // }

      // await promises;
      console.log("Done with", category);
      resolve(0);
    })
  );
}

await Promise.all(categoryPromises);

console.log("awaited all");

Deno.writeTextFile(
  "./out-object.json",
  JSON.stringify(categoryExtensions, null, 2)
);

for (const [category, extensions] of Object.entries(categoryExtensions)) {
  for (let i = 0; i < extensions.length; i++) {
    const extension = extensions[i];
    extensions[i] = [extension.name, extension.description] as any;
  }
}

Deno.writeTextFile(
  "./out-array.json",
  JSON.stringify(categoryExtensions, null, 2)
);

console.log("written")

await browser.close();
