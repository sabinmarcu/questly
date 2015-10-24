import fs from "fs";
import mime from "mime";
import uuid from "node-uuid";

console.log("Compiling", `${process.argv[2]}/files`);
let files = fs.readFileSync(`${process.argv[2]  }/files`, "utf-8").split("\n").map((i) => i.length > 0 && i).filter((it) => it);
let folders = [
        ...files.reduce((prev, it) =>
            prev.add(it.substr(0, it.lastIndexOf("/"))) && prev
        , new Set()),
    ];
let readmes = files.filter(it => /readme\.md$/.test(it));
// let previews = files.filter(it => /preview\.[a-z]+$/.test(it)).reduce((prev, it) =>
//     (prev[it.substr(0, it.lastIndexOf("/"))] = `data:${mime.lookup(it)};base64,${fs.readFileSync(it, "base64")}`) && prev
// , {});

let previews = files.filter(it => /preview\.[a-z]+$/.test(it)).reduce((prev, it) =>
    (prev[it.substr(0, it.lastIndexOf("/"))] = it.substr(it.lastIndexOf("/") + 1)) && prev
, {});

let descriptions = readmes.reduce((prev, file) => ( prev[file] = fs.readFileSync(file, "utf-8") ) && prev, {});

fs.writeFile("config.json", JSON.stringify({ files, folders, descriptions, previews }));
export default {files, folders, descriptions, previews};
