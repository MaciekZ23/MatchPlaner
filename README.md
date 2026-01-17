# MatchPlanner

**MatchPlanner** to webowa aplikacja służąca do przeglądania i śledzenia lokalnych turniejów piłki nożnej.

Projekt umożliwia przeglądanie terminarza rozgrywek, śledzenie wyników meczów, statystyk zawodników, składu drużyn. Aplikacja pozwala także wyróżniać najlepszych zawodników poprzez głosowanie na MVP meczu.

## Funkcje

- Przeglądanie listy drużyn i ich składów
- Terminarz meczów z wynikami
- Tabela punktowa i statystyki grupowe
- Ranking strzelców oraz czystych kont bramkarzy
- Głosowanie na zawodnika meczu MVP
- Modal szczegółów meczu z osią zdarzeń
- Wybór aktywnego turnieju
- Obsługa logowania i profilu użytkownika

## Technologie

- [Angular](https://angular.io/)
- [Bootstrap](https://getbootstrap.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [HTML / SCSS]
- Font Awesome

## Struktura projektu

- `src/app/home` – strona główna turnieju
- `src/app/teams` – drużyny i zawodnicy
- `src/app/calendar` – terminarz spotkań
- `src/app/tables` – tabele i statystyki
- `src/app/login` – obsługa logowania użytkownika
- `src/app/navbar` – nawigacja główna
- `src/app/topbar` – panel logowania / pasek użytkownika
- `src/app/tournament-picker` – wybór aktywnego turnieju
- `src/app/core` – store turnieju, modele domenowe, mock-API
- `src/app/shared` – współdzielone komponenty

## Wymagania

- Node.js (zalecana wersja >= 18)
- npm
- Angular CLI

## Instalacja lokalna

1. Sklonuj repozytorium projektu: `git clone https://github.com/MaciekZ23/MatchPlaner.git`
2. Przejdź do katalogu projektu: `cd MatchPlanner`
3. Zainstaluj zależności: `npm install`
4. Zainstaluj Angular CLI: `npm install -g @angular/cli`
5. Uruchom aplikację frontendową w trybie deweloperskim: `npm run startWithProxy`

Po uruchomieniu aplikacja dostępna jest pod adresem: http://localhost:4200

## Komunikacja z backendem

Frontend komunikuje się z backendem aplikacji za pośrednictwem interfejsu REST API, z wykorzystaniem mechanizmu proxy.

## Testy

Testy end-to-end aplikacji frontendowej zostały zrealizowane z wykorzystaniem narzędzia Playwright.

1. Instalacja zależności Playwright:
   `npx playwright install`
2. Inicjalizacja konfiguracji Playwright (jednorazowo):
   `npm init playwright@latest`
3. Uruchomienie przykładowego testu end-to-end dla modułu turniejów:
   `npx playwright test tests/teams-navigation-return.spec.ts`
