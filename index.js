const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const core = require("@actions/core");
const glob = require('@actions/glob');

async function run() {
    const workspacePath = process.env.GITHUB_WORKSPACE;
    const argPath = core.getInput("path", { required: true });
    const argOutput = core.getInput("output", { required: true });
    core.info(`Ready to zip "${argPath}" into ${argOutput}`);
    const zip = new AdmZip();
    const globber = await glob.create(argPath);
    for await (const file of globber.globGenerator()) {
        const stats = fs.lstatSync(file);
        if (!stats.isDirectory()) {
            core.debug(`Add file ${file}`);
            const zippath = path.relative(workspacePath, file);
            zip.addFile(zippath, fs.readFileSync(file), "", 0);
        }
    }
    zip.writeZip(path.join(workspacePath, argOutput));
    core.info(`\nZipped file ${argOutput} successfully`);
}

run()
