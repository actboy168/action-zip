const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
const glob = require('@actions/glob');
const AdmZip = require("adm-zip");

async function run() {
    const workspacePath = process.env.GITHUB_WORKSPACE;
    const argPath = core.getInput("path", { required: true });
    const argName = core.getInput("name", { required: true });
    core.info(`Zip path: ${argPath}`);
    const zip = new AdmZip();
    const globber = await glob.create(argPath);
    for await (const file of globber.globGenerator()) {
        const stats = fs.lstatSync(file);
        if (!stats.isDirectory()) {
            const zippath = path.relative(workspacePath, file);
            zip.addFile(zippath, fs.readFileSync(file), "", 0);
        }
    }
    const argOutput = path.join(argName, ".zip");
    zip.writeZip(argOutput);
    core.info(`Zipped file ${argOutput} successfully`);
    core.setOutput('output', argOutput);
}

run()
