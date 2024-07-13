const path = require("path");
const pkg = require("./package.json");
const cp = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");

const PATH_DIST = path.resolve(process.cwd(), "dist");

process.env = Object.assign({
    NODE_ENV: "production"
}, process.env);

module.exports = function (grunt) {

    grunt.initConfig({
        pkg
    });


    grunt.registerTask("compress", () => {
        cp.execSync(`cd ./out/uf2-converter-linux-x64 && tar -czvf ${path.join(PATH_DIST, `${pkg.name}-v${pkg.version}.tgz`)} *`, {
            env: process.env,
            stdio: "inherit"
        });
    });


    grunt.registerTask("copy", () => {
        [
            `cp ./out/make/deb/x64/${pkg.name}_${pkg.version}_amd64.deb ./dist/`,
            `cp ./out/make/rpm/x64/${pkg.name}-${pkg.version}-1.x86_64.rpm ./dist/`,
        ].forEach((cmd) => {
            cp.execSync(cmd, {
                env: process.env,
                stdio: "inherit"
            });
        });       
    });


    grunt.registerTask("checksum", () => {

        let m5f = path.join(PATH_DIST, "./checksums.txt");

        fs.rmSync(m5f, { force: true });
        let files = fs.readdirSync(PATH_DIST);
        let fd = fs.openSync(m5f, "w");

        files.forEach((name) => {

            let file = path.join(PATH_DIST, name);
            let content = fs.readFileSync(file);
            let hasher = crypto.createHash("md5");
            let hash = hasher.update(content).digest("hex");
            fs.writeSync(fd, `${hash}\t${name}${os.EOL}`);

        });

        fs.closeSync(fd);

    });


    grunt.registerTask("release", () => {
        [
            `mkdir -p ${PATH_DIST}`,
            "npm run make",
            "grunt compress",
            "grunt copy",
            "grunt checksum"
        ].forEach((cmd) => {
            cp.execSync(cmd, {
                env: process.env,
                stdio: "inherit"
            });
        });
    });



};