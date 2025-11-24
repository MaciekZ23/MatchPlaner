import { test, expect } from '@playwright/test';

test('Guest can navigate from the tournament home page to the calendar view', async ({
  page,
}) => {
  // Wejście na stronę logowania
  await page.goto('http://localhost:4200/login');

  // Logowanie jako gość
  await page.getByRole('button', { name: /gość|guest|quest/i }).click();

  // Czekamy aż pojawi się lista turniejów
  await expect(page).toHaveURL(/\/tournaments$/);

  // Wybór turnieju
  const chooseButton = page.getByRole('button', { name: /wybierz/i }).first();
  await chooseButton.click();

  // Przejście do /:tid/home
  await expect(page).toHaveURL(/\/t[^/]+\/home/);

  // Wybieramy zakładkę Kalendarza
  const calendarButton = page.getByRole('link', { name: /terminarz/i });
  await expect(calendarButton).toBeVisible();
  await calendarButton.click();

  // Czekamy na przekierowanie do /:tid/calendar
  await expect(page).toHaveURL(/\/t[^/]+\/calendar$/);

  // Sprawdzamy czy treść kalendarza się załadowała
  await expect(page.locator('body')).toContainText(
    /terminarz|sierpnia|grudnia|rozgrywek/i
  );
});
