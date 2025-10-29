# Changelog

## 1.12.1

### (FIX) Sidebar / nawigacja — zachowanie na tabletach i desktopie

- Naprawiono samoczynne otwieranie sidebaru przy scrollu lub kliknięciu poza nawigacją
- Uporządkowano przepływ stanu sidebaru — sterowanie stanem wyłącznie z `AppComponent`
- Wyeliminowano problem rozjeżdżających się marginesów widoku treści

## 1.12.0

## (FEATURE) Wgrywanie zdjęcia do formularzy + obsługa polskich znaków

- Dodano możliwość wgrywania pliku graficznego (logo / zdjęcie) w formularzach drużyn i turnieju
- Formularz umożliwia jednoczesne podanie adresu URL logo/zdjęcia lub wgranie nowego pliku
- Cała aplikacja frontendowa poprawnie obsługuje polskie znaki diakrytyczne (np. ą, ę, ś, ć, ż, ź, ó, ł)

## 1.11.0

### (FEATURE) Wskaźniki ładowania (spinnery) w modułach

- Dodano komponenty `spinner` do modułów **Tabele**, **Drużyny** oraz **Kalendarz**
- Ujednolicono sposób obsługi stanu ładowania w komponentach

## 1.10.0

### (FEATURE) Łączenie z backendem

- Dodano łączenie z backendem

## 1.9.0

### (FEATURE) Drabinka play-off

- Dodano drabinkę play-off (pucharową)

## 1.8.0

### (FEATURE) Bazowy model turnieju, model glosowania na MVP zawodnika meczu

- Dodano bazowe modele turnieju: Tournament, Stage, Group, Team, Player, Match
- Dodano zakładkę MVP w modalu meczu z pełnym przepływem głosowania
- Dodano podsumowanie głosów (liczba, procenty, oznaczenie zwycięzcy)
- Dodano odliczanie do końca głosowania na podstawie closesAtISO
- Zmieniono serwisy na strumieniowe (Observable) i użyto async pipe
- Zmieniono routing drużyn: /teams/:id – szybki podgląd składu z listy
- Dodano obsługę goli samobójczych i kartek (żółta / druga żółta / czerwona) z ikonami
- Dodano uniwersalny ConfirmModal (tytuł, wiadomość, etykiety, wariant przycisku)
- Zmieniono widok szczegółów: asysty nie są już pokazywane w timeline (zostają w MVP)
- Naprawiono błędy WCAG (ARIA, fokusowalność)

## 1.7.0

### (FEATURE) Widok mobilny – Karta Tabele

- Naprawiono błędy WCAG (ARIA, fokusowalność)
- Poprawiono kontrast danych w tabelach
- Ujednolicono typografię i układ nagłówków na mobile
- Wprowadzono przewijanie treści tabel przy stałym nagłówku

## 1.6.0

### (FEATURE) Widok mobilny – Karta Drużyny

- Naprawiono błędy WCAG (ARIA, fokusowalność)
- Ulepszono wygląd tytułu i nagłówka tabeli w widoku mobilnym
- Uporządkowano układ i rozmiary elementów (logo, przycisk, odstępy)
- Dodano komponent `page-header` do każdej wymaganej karty w aplikacji
- Wprowadzono przewijanie w obrębie kontenerów zamiast globalnego scrolla dla całej aplikacji

## 1.5.0

### (FEATURE) Implementacja zakładki Topbar i dodanie spinera

- Dodano nowy komponent `topbar` – pasek górny z ikoną powiadomień i menu użytkownika
- Wprowadzono globalny komponent `spinner`, używany jak na razie przy przełączaniu widoków w module drużyn

## 1.4.0

### (FEATURE) Widok mobilny dla terminarza

- Dodano responsywny widok mobilny dla kart terminarza (`calendar-day` oraz `match-card`)
- Dostosowanie rozmiarów czcionek, przycisków oraz paddingów do ekranów smartfonów
- Zmniejszone logotypy i badge wyników na urządzeniach mobilnych

## 1.3.1

### (FIX) Porządki w strukturze projektu i stylach

- Refaktoryzacja plików SCSS w projekcie — ujednolicenie stylów, drobne poprawki i optymalizacja kodu
- Dodanie folderów `misc` w modułach z plikami stringów oraz utworzenie plików barell (`index.ts`) dla wygodniejszego importowania
- Uzupełnienie `styles.scss` o paletę kolorów

## 1.3.0

### (FEATURE) Implementacja zakładki Terminarz (karty-rozwijane)

- Dodano rozwijane daty z listą meczów
- Mecze prezentowane w kartach, kliknięcie otwiera modal ze szczegółami
- Podział na komponenty: `calendar-day` oraz `match-card`
- Dodano mockowany serwis `MatchService` do dostarczania danych meczów

## 1.2.2

### (FIX) Poprawki w widoku mobilnym

- Dostosowanie layoutu zakładek dla małych ekranów

## 1.2.1

### (FIX) Poprawki zakładki Drużyny

- Usprawnienie wyświetlania drużyn i zawodników
- Korekta danych w tabelach drużyn
- Poprawki wyglądu zakładki zespołów

## 1.2.0

### (FEATURE) Implementacja zakładki Drużyny

- Dodano zakładkę wyświetlającą listę drużyn
- Możliwość wejścia w szczegóły drużyny i powrotu
- Tabela zawodników powiązanych z drużyną

## 1.1.0

### (FEATURE) Implementacja zakładki Tabele

- Dodano zakładkę prezentującą tabele wyników
- Poprawki w nawigacji

## 1.0.0

### (FEATURE) Wersja początkowa projektu

- Implementacja zakładki Navbar
- Dodanie strony głównej
- Utworzenie pliku `README.md`
