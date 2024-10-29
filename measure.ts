import out from "./out.json" with { type: "json" };


let fileTypes = 0

for (const [category, extensions] of Object.entries(out)) {
  fileTypes += extensions.length
}

console.log("File types: ", fileTypes)