import { test, expect } from '@playwright/test';

test('Guest sees correct tooltip on clean sheets sort button', async ({
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

  // Kliknięcie zakładki Tabele
  const teamsLink = page.getByRole('link', { name: /tabele/i });
  await teamsLink.click();

  // Oczekiwanie na przejście do /:tid/tables
  await expect(page).toHaveURL(/\/t[^/]+\/tables$/);

  // Sekcja bramkarzy
  const collapseBtn = page.locator('#goalkeepersTitle button');

  // Upewniamy się że sekcja jest rozwinięta
  const tableCollapse = page.locator('#goalkeepersCollapse');
  if (!(await tableCollapse.isVisible())) {
    await collapseBtn.click();
  }

  // Wyszukanie przycisku sortowania
  const sortButton = page.locator('#goalkeepersCollapse th.sortable button');

  // Hover na przycisku
  await sortButton.hover();

  // Tooltip jako element o roli tooltip lub tekst
  const tooltip = page.getByRole('tooltip', { name: /sortuj/i });

  await expect(tooltip).toBeVisible();

  // Sprawdzenie treści tooltipa
  await expect(tooltip).toContainText(/sortuj (malejąco|rosnąco)/i);
});
