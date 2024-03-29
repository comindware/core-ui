const fs = require('fs');
const exec = require('child_process').exec;

const pathResolver = require('../pathResolver');

const removeBom = text => text.replace(/^\uFEFF/, '');

module.exports = callback => {
    exec('git tag -l 2.1.* --sort=v:refname', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }

        if (stderr) {
            console.log(stderr);
        }

        const matchResult = stdout.split(/\r\n|\n/).filter(i => i);
        if (!matchResult || !matchResult.length) {
            console.log('PrepareToPublishTask: no tags found, skip package.json update.');
            callback();
            return;
        }

        console.log(matchResult);
        const version = matchResult[matchResult.length - 1];
        const previousVersion = matchResult[matchResult.length - 2];

        process.env.PACKAGE_VERSION = version;
        process.env.PREVIOUTS_PACKAGE_VERSION = previousVersion;

        console.log(`PrepareToPublishTask: There are tags on the build that match the version pattern. Updating package.json version from ${previousVersion} to ${version}...`);
        const packageJson = JSON.parse(removeBom(fs.readFileSync(pathResolver.root('package.json'), 'utf8')));
        packageJson.version = version;
        fs.writeFileSync(pathResolver.root('package.json'), JSON.stringify(packageJson, null, '    '), 'utf8');
        console.log(`PrepareToPublishTask: package.json has been successfully updated to version ${version}.`);
        callback();
    });
};
