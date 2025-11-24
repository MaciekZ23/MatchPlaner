import { test, expect } from '@playwright/test';

test('Guest is redirected to the home page after selecting a tournament', async ({
  page,
}) => {
  // Wejście na stronę logowania
  await page.goto('http://localhost:4200/login');

  // Logowanie jako gość
  await page.getByRole('button', { name: /gość|guest|quest/i }).click();

  // Czekamy aż Angular przekieruje na listę turniejów
  await expect(page).toHaveURL(/\/tournaments$/);

  // Pobierz pierwszy dostępny przycisk "Wybierz"
  const chooseButton = page.getByRole('button', { name: /wybierz/i }).first();

  // Kliknięcie przycisku wyboru turnieju
  await chooseButton.click();

  // Oczekujemy przekierowania do widoku turnieju /:tid/home
  await expect(page).toHaveURL(/\/t[^/]+\/home/);

  // Sprawdzamy czy strona faktycznie się załadowała
  await expect(page.locator('body')).toContainText(
    /Liga|Rozgrywki|Mecz|Turniej/i
  );
});
