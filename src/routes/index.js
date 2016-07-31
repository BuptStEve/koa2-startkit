/**
 * @Author: steve
 * @Date:   2016-Jul-16 15:16:05
 * @Last modified by:   steve
 * @Last modified time: 2016-Jul-16 16:06:18
 */

import Router from 'koa-router';
import indexCtrl from '../controllers/index_ctrl';

const router = new Router();

router.get('/', indexCtrl);

export default router;
