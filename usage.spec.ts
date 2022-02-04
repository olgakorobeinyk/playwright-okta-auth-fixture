import { expect, Page } from '@playwright/test'
import { test } from '../../fixtures/authContext'

test.describe('example test', () => {
  test.use({ withUser: 'super.admin' })
  
  test('test automatic login', async ({ page, storageState }) => {
    page.goto('your-app-with-okta-auth-url')

    console.log('access token: ' + process.env.AUTH_TOKEN)
  })
})
