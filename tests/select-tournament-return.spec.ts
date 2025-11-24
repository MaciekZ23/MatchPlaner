import { test, expect } from '@playwright/test';

test('Guest can return to tournaments list using the back button', async ({
  page,
}) => {
  // Wejście na stronę logowania
  await page.goto('http://localhost:4200/login');

  // Logowanie jako gość
  await page.getByRole('button', { name: /gość|guest|quest/i }).click();

  // Czekanie aż Angular przekieruje na listę turniejów
  await expect(page).toHaveURL(/\/tournaments$/);

  // Pobierz pierwszy dostępny przycisk "Wybierz"
  const chooseButton = page.getByRole('button', { name: /wybierz/i }).first();

  // Kliknięcie przycisku wyboru turnieju
  await chooseButton.click();

  // Oczekujemy przekierowania do widoku turnieju /:tid/home
  await expect(page).toHaveURL(/\/t[^/]+\/home/);

  // Znalezienie przycisku powrotnego do wyboru turnieju w topbarze
  const backButton = page.getByRole('button', { name: /wróć.*wyboru/i });

  // Kliknięcie przycisku powrotnego do wyboru turnieju
  await backButton.click();

  // Oczekujemy powrotu na listę turniejów
  await expect(page).toHaveURL(/\/tournaments$/);
});
