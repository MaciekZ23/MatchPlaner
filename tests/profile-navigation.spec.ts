import { test, expect } from '@playwright/test';

test('Guest can navigate from the tournament home page to the profile view', async ({
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

  // Otworzenie dropdownu użytkownika
  const avatarButton = page.getByRole('button', { name: /menu użytkownika/i });
  await expect(avatarButton).toBeVisible();
  await avatarButton.click();

  // Wejście w opcję Profil
  await page.getByRole('menuitem', { name: /profil/i }).click();

  // Czekamy na przekierowanie do /:tid/profile
  await expect(page).toHaveURL(/\/t[^/]+\/profile$/);

  // Sprawdzamy czy strona profilu faktycznie się załadowała
  await expect(page.locator('body')).toContainText(/gość|rola|id urządzenia/i);
});
