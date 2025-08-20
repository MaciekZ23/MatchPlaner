# Changelog

## 1.5.0

### (FEATURE) Implementacja zakładki Topbar i dodanie spinera

* Dodano nowy komponent **Topbar** – pasek górny z ikoną powiadomień i menu użytkownika
* Wprowadzono globalny komponent **Spinner**, używany jak na razie przy przełączaniu widoków w module drużyn

## 1.4.0

### (FEATURE) Widok mobilny dla terminarza

* Dodano responsywny widok mobilny dla kart terminarza (`calendar-day` oraz `match-card`)
* Dostosowanie rozmiarów czcionek, przycisków oraz paddingów do ekranów smartfonów
* Zmniejszone logotypy i badge wyników na urządzeniach mobilnych

## 1.3.1

### (FIX) Porządki w strukturze projektu i stylach

* Refaktoryzacja plików SCSS w projekcie — ujednolicenie stylów, drobne poprawki i optymalizacja kodu
* Dodanie folderów `misc` w modułach z plikami stringów oraz utworzenie plików barell (`index.ts`) dla wygodniejszego importowania
* Uzupełnienie `styles.scss` o paletę kolorów


## 1.3.0

### (FEATURE) Implementacja zakładki Terminarz (karty-rozwijane)
* Dodano rozwijane daty z listą meczów
* Mecze prezentowane w kartach, kliknięcie otwiera modal ze szczegółami
* Podział na komponenty: `calendar-day` oraz `match-card`
* Dodano mockowany serwis `MatchService` do dostarczania danych meczów

## 1.2.2

### (FIX) Poprawki w widoku mobilnym

* Dostosowanie layoutu zakładek dla małych ekranów

## 1.2.1

### (FIX) Poprawki zakładki Drużyny

* Usprawnienie wyświetlania drużyn i zawodników
* Korekta danych w tabelach drużyn
* Poprawki wyglądu zakładki zespołów

## 1.2.0

### (FEATURE) Implementacja zakładki Drużyny

* Dodano zakładkę wyświetlającą listę drużyn
* Możliwość wejścia w szczegóły drużyny i powrotu
* Tabela zawodników powiązanych z drużyną

## 1.1.0

### (FEATURE) Implementacja zakładki Tabele

* Dodano zakładkę prezentującą tabele wyników
* Poprawki w nawigacji

## 1.0.0

### (FEATURE) Wersja początkowa projektu

* Implementacja zakładki Navbar
* Dodanie strony głównej
* Utworzenie pliku `README.md`
