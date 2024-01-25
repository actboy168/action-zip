const fs = require("fs");
const path = require("path");
const process = require('process')
const core = require("@actions/core");
const glob = require('@actions/glob');

async function run() {
    const workspacePath = process.env.GITHUB_WORKSPACE;
    const argPath = core.getInput("path", { required: true });
    const argName = core.getInput("name", { required: true });
    const globber = await glob.create(argPath);
    core.info(`Zip path: ${argPath}`);
    if (process.platform === 'win32') {
        const argOutput = argName + ".zip";
        const AdmZip = require("adm-zip");
        const zip = new AdmZip();
        for await (const file of globber.globGenerator()) {
            const stats = fs.lstatSync(file);
            if (!stats.isDirectory()) {
                const zippath = path.relative(workspacePath, file);
                zip.addFile(zippath, fs.readFileSync(file), "", 0);
            }
        }
        zip.writeZip(argOutput);
        core.info(`Zipped file ${argOutput} successfully`);
        core.setOutput('output', argOutput);
    }
    else {
        const argOutput = argName + ".tar.gz";
        const tar = require("tar");
        let files = [];
        for await (const file of globber.globGenerator()) {
            const stats = fs.lstatSync(file);
            if (!stats.isDirectory()) {
                const zippath = path.relative(workspacePath, file);
                files.push(zippath);
            }
        }
        tar
          .c({ cwd: workspacePath, gzip: true, sync: true }, files)
          .pipe(fs.createWriteStream(argOutput));
        core.info(`Zipped file ${argOutput} successfully`);
        core.setOutput('output', argOutput);
    }
}

run()
