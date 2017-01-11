'use strict';

const csrfLogin = require('csrf-login');
const requestify = require('requestify');

require('dotenv').config();

async function run() {
  const { ZAPIER_WEBHOOKS_URL, TRUTHFINDER_LOGIN_EMAIL, TRUTHFINDER_LOGIN_PASSWORD } = process.env;
  const info = await csrfLogin({ email: TRUTHFINDER_LOGIN_EMAIL, password: TRUTHFINDER_LOGIN_PASSWORD });
  const data = await info.requestAsync('/dashboard/report/phone/8183097126', {});

  const res = await requestify.post(ZAPIER_WEBHOOKS_URL, { rawHtml: data.body });
  console.log(res.body);
}

run();
