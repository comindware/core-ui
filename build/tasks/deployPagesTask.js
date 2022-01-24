const fs = require('fs');
const execSync = require('child_process').execSync;

const pathResolver = require('../pathResolver');

const run = (cmd, cwd) => {
    execSync(`${cmd}`, {
        cwd,
        stdio: 'inherit'
    });
};

const copySyncRecursive = (src, dest) => {
    if (fs.existsSync(src)) {
        !fs.existsSync(dest) && fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(file => {
            const srcPath = `${src}/${file}`;
            const destPath = `${dest}/${file}`;
            if (fs.lstatSync(srcPath).isDirectory()) {
                copySyncRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }
};

const copyDemo = resolver => {
    run('npm run build', pathResolver.demo());
    copySyncRecursive(pathResolver.demo('assets'), resolver());
};

const copyDoc = resolver => {
    copySyncRecursive(pathResolver.root('doc'), resolver('doc'));
};

module.exports = callback => {
    if (!process.env.PACKAGE_VERSION) {
        callback();
        return;
    }
    const token = process.env.GH_TOKEN;
    const ref = process.env.GH_REF;

    const pagesDir = pathResolver.pages();
    const pagesResolver = pathResolver.createResolver(pagesDir);
    !fs.existsSync(pagesDir) && fs.mkdirSync(pagesDir);
    run('git init', pagesDir);
    run('git config user.name "Github actions"', pagesDir);
    run('git config user.email "comindware-awesome-b@comindware.com"', pagesDir);
    copyDemo(pagesResolver);
    copyDoc(pagesResolver);
    run('git add -A', pagesDir);
    run('git commit -m "Auto-deploy to Github Pages"', pagesDir);
    run(`git push --force --quiet "https://${token}@${ref}" master:gh-pages`, pagesDir);
    callback();
};
