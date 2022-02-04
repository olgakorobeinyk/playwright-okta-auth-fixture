// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { request, test as base } from '@playwright/test'
import { User } from '../pageObjects/interfaces'
import users from '../users.json'

export const test = base.extend({
  withUser: 'foo.bar',

  storageState: async ({ withUser }, use) => {
    const state = await getAuthCookie(withUser)

    await use(state)
  },
})

async function getAuthCookie(withUser: string) {
  const user: User = users[withUser]
  const requestContext = await request.newContext()

  const oktaPrimaryAuthResponse = await requestContext.post(`${process.env.OKTA_DOMAIN}/api/v1/authn`, {
    data: {
      username: user.email,
      password: user.password,
      warnBeforePasswordExpired: true,
    },
  })
  const oktaPrimaryAuthResponseBody = await oktaPrimaryAuthResponse.json()
  const oktaSessionToken = oktaPrimaryAuthResponseBody.sessionToken

  const tokenParams = {
    response_type: 'token',
    scope: 'openid',
    state: 'TEST',
    nonce: 'TEST',
    client_id: process.env.OKTA_CLIENTID,
    redirect_uri: `${process.env.BASE_URL}/baz/login/callback`,
    sessionToken: oktaSessionToken,
  }

  const oktaTokenResponse = await requestContext.get(`${process.env.OKTA_DOMAIN}/oauth2/default/v1/authorize`, {
    params: tokenParams,
  })

  process.env.AUTH_TOKEN = oktaTokenResponse.url().split('access_token=')[1].split('&')[0]

  return requestContext.storageState()
}
