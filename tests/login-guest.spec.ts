import { test, expect } from '@playwright/test';

test('Guest is redirected to the tournaments page after logging in as a guest', async ({
  page,
}) => {
  // Wejście na stronę logowania
  await page.goto('http://localhost:4200/login');

  // Znalezienie przycisku "Continue as guest"
  const guestBtn = page.getByRole('button', { name: /gość|quest/i });

  // Kliknięcie przycisku
  await guestBtn.click();

  // Oczekiwanie na przekierowanie
  await expect(page).toHaveURL(/\/tournaments/);

  // Czy strona się załadowała
  await expect(page.locator('body')).toContainText(/turniej|tournament/i);
});
