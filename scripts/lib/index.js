const { resolve } = require("node:path");
const { spawnSync } = require("node:child_process");
const { existsSync, statSync, readdirSync, readFileSync } = require("node:fs");
const browserslist = require("browserslist");

function getRootPath() {
    return resolve(__dirname, "../../");
}

function getPkgsPath() {
    return resolve(getRootPath(), "packages");
}

function getRootPkgCfgs() {
    const rootPkgPath = resolve(getRootPath(), "package.json");
    if (!existsSync(rootPkgPath)) return {};
    return require(rootPkgPath);
}

function getSubPkgs() {
    if (!existsSync(getPkgsPath())) return [];
    return readdirSync(getPkgsPath())
        .map(name => {
            const path = resolve(getPkgsPath(), name);
            const pkgPath = resolve(path, "package.json");
            return {
                dirPath: path,
                dirName: name,
                pkgPath,
                pkgCfgs: existsSync(pkgPath) ? require(pkgPath) : {},
            };
        })
        .filter(({ dirPath }) => statSync(dirPath).isDirectory())
        .reduce((pkgs, curPkg) => {
            /* topological sorting */
            let i = pkgs.length - 1;
            if (i < 0) return [curPkg];
            for (; i >= 0; i--) {
                if (Object.keys(curPkg.pkgCfgs.dependencies || {}).includes(pkgs[i].pkgCfgs.name)) {
                    pkgs.splice(i + 1, 0, curPkg);
                    return pkgs;
                }
            }
            pkgs.unshift(curPkg);
            return pkgs;
        }, []);
}

function getBrowsersList(env = "production") {
    const config =
        browserslist.parseConfig(readFileSync(`${getRootPath()}/.browserslistrc`, { encoding: "utf8" }) || "") || {};
    return config[env] || [];
}

function getContributors(path = getRootPath()) {
    path = resolve(getRootPath(), path);
    const { stdout } = git(["shortlog", "HEAD", "-sne", ...(path == getRootPath() ? [] : [path])]);
    return (
        stdout.match(/ *\d+\t\S+( <\S+@\S+\.\S+>)?\n/g)?.map(row => ({
            name: /\t\S+/.exec(row)[0].trim(),
            ...(/ <\S+@\S+\.\S+>\n/.test(row)
                ? { email: / <\S+@\S+\.\S+>\n/.exec(row)[0].trim().replace(/[<>]/g, "") }
                : {}),
            summary: Number(/^ *\d+\t/.exec(row)[0].trim()),
        })) || []
    );
}

function git(args = [], options = {}) {
    options = Object.assign({ encoding: "utf8", cwd: getRootPath() }, options);
    return spawnSync("git", args, options);
}

function pnpm(args = [], options = {}) {
    options = Object.assign({ encoding: "utf8", cwd: getRootPath() }, options);
    switch (process.platform) {
        case "win32":
            return spawnSync("pnpm.cmd", args, options);
        default:
            return spawnSync("pnpm", args, options);
    }
}

function npx(args = [], options = {}) {
    options = Object.assign({ encoding: "utf8", cwd: getRootPath() }, options);
    switch (process.platform) {
        case "win32":
            return spawnSync("npx.cmd", args, options);
        default:
            return spawnSync("npx", args, options);
    }
}

function prettier(...files) {
    if (files.length === 0) return;
    return npx(["prettier", "--write", ...files]);
}

module.exports = {
    getRootPath,
    getPkgsPath,
    getRootPkgCfgs,
    getSubPkgs,
    getBrowsersList,
    getContributors,
    git,
    pnpm,
    npx,
    prettier,
};
