const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const core = require("@actions/core");
const glob = require('@actions/glob');

async function run() {
    const workspacePath = process.env.GITHUB_WORKSPACE
    const argPath = core.getInput("path");
    const argOutput = core.getInput("output");
    console.log(`Ready to zip "${argPath}" into ${argOutput}`);
    const zip = new AdmZip();
    const globber = await glob.create(argPath)
    for await (const file of globber.globGenerator()) {
        const stats = fs.lstatSync(file);
        if (!stats.isDirectory()) {
            const zippath = path.relative(workspacePath, file); 
            const zipdir = path.dirname(zippath);
            const zipname = path.basename(zippath);
            if (zipdir === ".") {
                zip.addLocalFile(file, "", zipname);
            }
            else {
                zip.addLocalFile(file, zipdir, zipname);
            }
        }
    }
    zip.writeZip(path.join(workspacePath, argOutput));
    console.log(`\nZipped file ${argOutput} successfully`);
}

run()
