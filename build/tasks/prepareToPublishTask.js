const fs = require('fs');
const exec = require('child_process').exec;

const pathResolver = require('../pathResolver');

const removeBom = text => text.replace(/^\uFEFF/, '');

module.exports = callback => {
    exec('git tag -l 2.0.* --sort=v:refname', (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }

        if (stdout) {
            console.log(stdout);
        }
        if (stderr) {
            console.log(stderr);
        }

        const matchResult = stdout.split('\n').filter(i => i);
        if (!matchResult || !matchResult.length) {
            console.log('PrepareToPublishTask: no tags found, skip package.json update.');
            return;
        }
        const version = matchResult[matchResult.length - 1];

        console.log(`PrepareToPublishTask: There are tags on the build that match the version pattern. Updating package.json with version ${version}...`);
        const packageJson = JSON.parse(removeBom(fs.readFileSync(pathResolver.root('package.json'), 'utf8')));
        packageJson.version = version;
        fs.writeFileSync(pathResolver.root('package.json'), JSON.stringify(packageJson, null, '    '), 'utf8');
        callback();
    });
};
