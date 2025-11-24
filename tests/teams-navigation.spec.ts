import { test, expect } from '@playwright/test';

test('Guest can navigate to the teams page and open a team’s player list', async ({
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

  // Sprawdzenie czy wczytała się tabela zawodników
  await expect(page.locator('table')).toContainText(
    /Imię i nazwisko|Pozycja|Nr koszulki|Stan zdrowia/i
  );
});
