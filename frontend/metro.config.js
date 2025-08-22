const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Normalize paths to forward slashes (fixes %5C on Windows)
  config.resolver.assetExts = config.resolver.assetExts || [];
  config.resolver.sourceExts = config.resolver.sourceExts || [];

  // Ensure paths use /
  config.watchFolders = config.watchFolders.map((folder) =>
    folder.split(path.sep).join(path.posix.sep)
  );

  return config;
})();
