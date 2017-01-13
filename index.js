'use strict';

require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const parseBody = require('koa-body');
const csrfLogin = require('csrf-login');
const requestify = require('requestify');

const app = new Koa();
const router = new Router();

const { ZAPIER_WEBHOOKS_URL, TRUTHFINDER_LOGIN_EMAIL, TRUTHFINDER_LOGIN_PASSWORD } = process.env;

async function enquireProfileData({ phoneNumber }) {
  const info = await csrfLogin({ email: TRUTHFINDER_LOGIN_EMAIL, password: TRUTHFINDER_LOGIN_PASSWORD });
  const data = await info.requestAsync(`/dashboard/report/phone/${phoneNumber}`, {});
  const res = await requestify.post(ZAPIER_WEBHOOKS_URL, { rawHtml: data.body });
  return res;
}

router.post('/', (ctx, next) => {
  const { phoneNumber } = ctx.request.body;
  if (phoneNumber) {
    enquireProfileData({ phoneNumber });
    ctx.body = {
      status: 'success'
    };
  } else {
    ctx.body = {
      status: 'error',
      message: 'phoneNumber must not be empty.'
    };
  }
  console.log(ctx.body);
  return next();
});

app.use(parseBody());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.PORT || 5000);
