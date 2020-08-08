module.exports = testFile => testFile.replace(/\.test\.ts$/, ".js").replace(/^test/, "lib");
