const fs = require('fs');
const exec = require('child_process').exec;

const pathResolver = require('../pathResolver');

module.exports = callback => {
    if (!process.env.PREVIOUS_PACKAGE_VERSION || !process.env.PACKAGE_VERSION) {
        callback();
        return;
    }
    exec(`git log --pretty=format:"%s" ${process.env.PREVIOUS_PACKAGE_VERSION}...${process.env.PACKAGE_VERSION}`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return;
        }
        if (stderr) {
            console.log(stderr);
        }

        const onlyUnique = array => array.filter((v, i, arr) => arr.indexOf(v) === i);

        const tasks = onlyUnique(stdout.match(/\[#[^\[]+\]/g) || []).join('');

        const template = `
${process.env.PREVIOUS_PACKAGE_VERSION}...${process.env.PACKAGE_VERSION}
${tasks}
========
${stdout.replace(/^Merge pull request.*[\r\n]*/gm, '')}
        `;
        fs.appendFileSync(pathResolver.root('CHANGELOG.md'), template, 'utf8');

        console.log(`CHANGELOG.md has been successfully generated between versions ${process.env.PREVIOUS_PACKAGE_VERSION}...${process.env.PACKAGE_VERSION}`);
        callback();
    });
}
