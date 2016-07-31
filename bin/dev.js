#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const debug = require('debug')('dev');
const chokidar = require('chokidar');
const babelCliDir = require('babel-cli/lib/babel/dir');
const babelCliFile = require('babel-cli/lib/babel/file');

const rootPath = path.resolve(__dirname, '..');
const srcPath = path.join(rootPath, 'src');
const appPath = path.join(rootPath, 'app');

const log = console.log.bind(console, '>>> [DEV]:');
const watcher = chokidar.watch(path.join(__dirname, '../src'));

const compileFile = (srcDir, outDir, filename, cb) => {
  const outFile = path.join(outDir, filename);
  const srcFile = path.join(srcDir, filename);

  try {
    babelCliFile({
      outFile: outFile,
      retainLines: true,
      highlightCode: true,
      comments: true,
      babelrc: true,
      sourceMaps: true,
    }, [
      srcFile,
    ], {
      highlightCode: true,
      comments: true,
      babelrc: true,
      ignore: [],
      sourceMaps: true,
    });
  } catch (e) {
    console.error('Error while compiling file %s', filename, e);
    return;
  }

  console.log(`${srcFile} -> ${outFile}`);
  cb();
};

const cacheClean = () => {
  Object.keys(require.cache).forEach(id => {
    if (/[\/\\](app)[\/\\]/.test(id)) {
      delete require.cache[id];
    }
  });

  log('♬ App Cache Cleaned...');
};

watcher.on('ready', () => {
  log('Compiling...');

  // compile all when start
  babelCliDir({
    outDir: 'app/',
    retainLines: true,
    sourceMaps: true,
  }, [
    'src/',
  ]);

  require('../app'); // eslint-disable-line global-require
  log('♪ App Started');

  watcher
    .on('add', absPath => {
      compileFile('src/', 'app/', path.relative(srcPath, absPath), cacheClean);
    })
    .on('change', absPath => {
      compileFile('src/', 'app/', path.relative(srcPath, absPath), cacheClean);
    })
    .on('unlink', absPath => {
      const rmfileRelative = path.relative(srcPath, absPath);
      const rmfile = path.join(appPath, rmfileRelative);

      try {
        fs.unlinkSync(rmfile);
        fs.unlinkSync(rmfile + '.map');
      } catch (e) {
        debug('fail to unlink', rmfile);
        return;
      }
      console.log('Deleted', rmfileRelative);
      cacheClean();
    });
});

process.on('exit', () => {
  log(' ♫ App Quit');
});
