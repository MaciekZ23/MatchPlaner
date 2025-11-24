import { test, expect } from '@playwright/test';

test('Guest can return from a team’s player view back to the teams page', async ({
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

  // Kliknięcie zakładki Drużyny
  const teamsLink = page.getByRole('link', { name: /drużyn|teams/i });
  await teamsLink.click();

  // Oczekiwanie na przejście do /:tid/teams
  await expect(page).toHaveURL(/\/t[^/]+\/teams$/);

  // Kliknięcie pierwszej dostępnej drużyny
  const firstTeam = page.locator('app-team-card').first();
  await firstTeam.click();

  // Oczekiwanie na przejście do strony drużyny: /:tid/teams/:teamId
  await expect(page).toHaveURL(/\/t[^/]+\/teams\/\d+$/);

  // Kliknięcie przycisku powrotu
  await page.getByRole('button', { name: /powrót/i }).click();

  // Oczekiwanie na przejście do listy drużyn
  await expect(page).toHaveURL(/\/t[^/]+\/teams$/);

  // Sprawdzenie czy wczytała się lista drużyn
  await expect(
    page.getByRole('region', { name: /lista drużyn/i })
  ).toBeVisible();
});
