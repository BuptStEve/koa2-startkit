/**
 * @Author: steve
 * @Date:   2016-Jul-16 14:57:15
 * @Last modified by:   steve
 * @Last modified time: 2016-Jul-16 16:47:22
 */


import Koa from 'koa';
import http from 'http';
import path from 'path';
import views from 'koa-views';
import logger from 'koa-logger';
import convert from 'koa-convert';
import koaStatic from 'koa-static-plus';
import koaOnError from 'koa-onerror';
import Bodyparser from 'koa-bodyparser';

import config from './config';
import Router from './routes';

const app = new Koa();
const bodyparser = new Bodyparser();

// middlewares
app.use(convert(bodyparser));
app.use(convert(logger()));

// static
app.use(convert(koaStatic(path.join(__dirname, '../public'), {
  pathPrefix: '',
})));

// views
app.use(views(path.join(__dirname, '../views'), {
  extension: 'pug',
}));

// 500 error
koaOnError(app, {
  template: 'views/500.pug',
});

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// response router
app.use(async (ctx, next) => {
  await Router.routes()(ctx, next);
});

// 404
/* eslint no-param-reassign: ["error", { "props": false }] */
app.use(async (ctx) => {
  ctx.status = 404;
  await ctx.render('404');
});

// error logger
app.on('error', async (err) => {
  console.log('error occured:', err);
});

const port = parseInt(config.port || '3000', 10);
const server = http.createServer(app.callback());

server.listen(port);
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
server.on('listening', () => {
  console.log(`Listening on port: ${port}`);
});

export default app;
