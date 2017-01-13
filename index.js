'use strict';

require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const csrfLogin = require('csrf-login');
const requestify = require('requestify');

const app = new Koa();
const router = new Router();

const { ZAPIER_WEBHOOKS_URL, TRUTHFINDER_LOGIN_EMAIL, TRUTHFINDER_LOGIN_PASSWORD } = process.env;

router.get('/', async (ctx, next) => {
  const { phoneNumber } = ctx.query;
  const info = await csrfLogin({ email: TRUTHFINDER_LOGIN_EMAIL, password: TRUTHFINDER_LOGIN_PASSWORD });
  const data = await info.requestAsync(`/dashboard/report/phone/${phoneNumber}`, {});
  const res = await requestify.post(ZAPIER_WEBHOOKS_URL, { rawHtml: data.body });

  console.log(res.body);
  ctx.body = res.body;
  return next();
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(5000);
