import { test, expect } from '@playwright/test';

test('Guest can sort the goalkeeper clean sheets table', async ({ page }) => {
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
    await expect(tableCollapse).toBeVisible();
  }

  // Pobieramy pierwsze trzy wartości przed sortowaniem
  const beforeSort = await page
    .locator(
      '#goalkeepersCollapse .table-body-container tbody tr td:nth-child(4)'
    )
    .allInnerTexts();

  // Kliknięcie w przycisk sortowania
  const sortButton = page
    .locator('#goalkeepersCollapse th.sortable button')
    .first();
  await sortButton.click();

  // Pobieramy wartości po sortowaniu
  const afterSort = await page
    .locator(
      '#goalkeepersCollapse .table-body-container tbody tr td:nth-child(4)'
    )
    .allInnerTexts();

  // Zamieniamy teksty na liczby
  const beforeNums = beforeSort.map(Number);
  const afterNums = afterSort.map(Number);

  // Po kliknięciu sortowanie musi zmienić kolejność
  expect(afterNums).not.toEqual(beforeNums);

  // Dane po sortowaniu muszą być posortowane
  const sortedAsc = [...afterNums].sort((a, b) => a - b);
  const sortedDesc = [...afterNums].sort((a, b) => b - a);

  expect(
    afterNums.toString() === sortedAsc.toString() ||
      afterNums.toString() === sortedDesc.toString()
  ).toBeTruthy();
});
