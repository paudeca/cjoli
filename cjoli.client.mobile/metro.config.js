// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config').MetroConfig}
 */
const { getDefaultConfig } = require("expo/metro-config");
const { makeMetroConfig } = require("@rnx-kit/metro-config");
const MetroSymlinksResolver = require("@rnx-kit/metro-resolver-symlinks");

const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  //isCSSEnabled: true,
});

//config.resolver.sourceExts.push("mjs");
//config.resolver.nodeModulesPaths.push("../cjoli.client.core"),
//(config.resolver.useWatchman = true);
/*config.resolver.resolveRequest = MetroSymlinksResolver();


const config = makeMetroConfig({
  resolver: { resolveRequest: MetroSymlinksResolver() },
});
config.resolver.sourceExts.push("mjs");*/

module.exports = config;
