import { test, expect } from '@playwright/test';

test.skip('test', async ({ page }) => {
  // Recording...
  //login
  await page.goto('http://localhost:5173/login');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('alice@example.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.getByRole('button', { name: 'Sign in' }).click();


  //logout cancel
  await page.getByRole('button', { name: 'logout Logout' }).click();
  await page.getByRole('button', { name: 'Cancel' }).nth(2).click();

  //logout success
  await page.getByRole('button', { name: 'logout Logout' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  //book appointment

  await page.locator('body').press('ControlOrMeta+Shift+C');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('alice@example.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.locator('div').filter({ hasText: /^Sign in$/ }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Book an Appointment' }).click();
  await page.getByRole('button', { name: 'Show Doctor Availability' }).click();
  await page.getByRole('button', { name: '30' }).click();
  await page.getByRole('button', { name: '6:00 PM' }).click();
  await page.getByRole('button', { name: 'Next: Choose Date & Time' }).click();
  await page.getByRole('button', { name: '27' }).nth(1).click();
  await page.getByRole('button', { name: '7:00 PM' }).nth(1).click();
  await page.getByRole('button', { name: 'Create Appointment' }).click();
  await page.getByRole('button', { name: 'Done' }).click();
});
await page.getByRole('button', { name: 'Book an Appointment' }).click();
await page.getByRole('heading', { name: 'Available Doctors (6)' }).click();