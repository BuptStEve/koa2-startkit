/**
 * @Author: steve
 * @Date:   2016-Jul-02 15:39:12
 * @Last modified by:   steve
 * @Last modified time: 2016-Jul-16 16:06:36
 */

export default async (ctx) => {
  const title = 'koa2 title';

  await ctx.render('index', {
    title,
  });
};
