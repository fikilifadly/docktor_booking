import { test, expect } from '@playwright/test'

test.describe('Appointment Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('http://localhost:8000/graphql', async (route) => {
      const body = route.request().postDataJSON()
      console.log("here: ", body)

      const operationName = body?.operationName || ''
      const query = body?.query || ''

      console.log('GRAPHQL HIT:', operationName)

      // 🧑‍⚕️ DOCTORS
      if (
        operationName === 'DoctorsQuery' ||
        query.toLowerCase().includes('doctors')
      ) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              doctors: [
                {
                  id: '1',
                  name: 'Dr. Stephen Strange',
                  specialty: 'Surgery',
                  avatarUrl: null,
                },
              ],
            },
          }),
        })
      }

      // 📅 APPOINTMENTS
      if (
        operationName === 'AppointmentsByPatient' ||
        query.toLowerCase().includes('appointments')
      ) {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              appointmentsByPatient: [],
            },
          }),
        })
      }

      // fallback
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: {} }),
      })
    })
  })

  test.describe('Logout Flow', () => {
    test('Logout Success', async ({ page }) => {
      await page.goto('/appointments')
      await page.click('text=Logout')

      await expect(page.getByText(/confirm/i)).toBeVisible()

      await page.click('button:has-text("Confirm")')

      await expect(page).toHaveURL(/login/)
    })

    test('Logout Cancel', async ({ page }) => {
      await page.goto('/appointments')
      await page.click('text=Logout')

      await expect(page.getByText(/confirm/i)).toBeVisible()

      await page.click('button:has-text("Cancel")')

      await expect(page).toHaveURL(/appointments/)
    })
  })

  test.describe('Book Appointment Flow', () => {
    test.only('should saw doctor availability when doctor is selected and show availability button is clicked', async ({ page }) => {
      await page.goto('/appointments')

      await page.click('text=Book an Appointment')

      await expect(page.getByText('New Appointment')).toBeVisible()
      // i got issue with hooks
      // the doctors always return empty string
      // based on my research i still cant find a way to mock the hooks
      // the main issue was, because the backend was on port 8000
      // but the playwright test is using port 5173 
      await expect(page.getByText('Dr. Stephen Strange')).toBeVisible()

      await page.click('text=Show Doctor Availability')

      await expect(page.getByText('Select a Date')).toBeVisible()

      await page.click('text=27')

      await expect(page.getByText('11:00 AM')).toBeVisible()
    })
  })
})
