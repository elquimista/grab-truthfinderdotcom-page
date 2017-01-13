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

async function enquireProfileData({ eventName, firstName, lastName, email, phoneNumber }) {
  let res, obj = arguments[0];

  if (phoneNumber.replace(/\D/g, '').match(/^1?[2-9]\d{2}[2-9](?!11)\d{2}\d{4}$/)) {
    const info = await csrfLogin({ email: TRUTHFINDER_LOGIN_EMAIL, password: TRUTHFINDER_LOGIN_PASSWORD });
    const data = await info.requestAsync(`/dashboard/report/phone/${phoneNumber}`, {});
    obj = Object.assign({}, obj, { rawHtml: data.body });
  } else {
    obj = Object.assign({}, obj, { rawHtml: 'Invalid phone number' });
  }

  res = await requestify.post(ZAPIER_WEBHOOKS_URL, obj);
  console.log(res);
  return res;
}

router.post('/', (ctx, next) => {
  const { eventName, firstName, lastName, email, phoneNumber } = ctx.request.body;
  if (phoneNumber) {
    enquireProfileData({ eventName, firstName, lastName, email, phoneNumber });
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
