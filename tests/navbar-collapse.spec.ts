import { test, expect } from '@playwright/test';

test('Guest can toggle the sidebar (collapse and expand state)', async ({
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

  // Pobranie referencji do sidebaru i przycisku toggle
  const sidebar = page.locator('#sidebar');
  const toggleButton = page.locator('.sidebar-toggle');

  // Początkowo sidebar rozwinięty (nie ma klasy `collapsed`)
  await expect(sidebar).not.toHaveClass(/collapsed/);

  // Kliknięcie powoduje zwijanie sidebara
  await toggleButton.click();
  await expect(sidebar).toHaveClass(/collapsed/);

  // Kolejne kliknięcie powoduje rozwijanie sidebara
  await toggleButton.click();
  await expect(sidebar).not.toHaveClass(/collapsed/);
});
