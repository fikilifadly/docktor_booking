import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText('HealthPlus')).toBeVisible()
    await expect(page.getByText('Patient Login')).toBeVisible()

    await page.getByPlaceholder('Email address').fill('alice@example.com')
    await page.getByPlaceholder('Password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/appointments/)

    const authToken = await page.evaluate(() => {
      return localStorage.getItem('auth_token')
    })
    const authPatient = await page.evaluate(() => {
      return localStorage.getItem('auth_patient')
    })


     expect(authToken).not.toBeNull()
     expect(authPatient).not.toBeNull()
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder('Email address').fill('wrong@test.com')
    await page.getByPlaceholder('Password').fill('wrongpassword')

    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()

    await expect(page).toHaveURL(/login/)
  })

  test('should show error when email is invalid', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder('Email address').fill('wrong@')
    await page.getByPlaceholder('Password').fill('1234567')

    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()

    await expect(page).toHaveURL(/login/)
  })

  test('should show error when email is valid but password is too short', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder('Email address').fill('alice@example.com')
    await page.getByPlaceholder('Password').fill('123')

    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()

    await expect(page).toHaveURL(/login/)
  })
})