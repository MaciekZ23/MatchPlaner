import { Injectable } from '@angular/core';
import { Team } from '../models/team';

@Injectable({
  providedIn: 'root'
})

export class TeamService {
  constructor() { }
  getTeams(): Team[] {
    return [
      {
        id: 1,
        name: 'Stajnia Kuniccy',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_PwRy6Kx9DqJCU3Wy_Ww8P01wP5gg1pxpOw&s',
        players: [
          { name: 'Jan Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Marek Zieliński', position: 'Napastnik', shirtNumber: 9, healthStatus: 'Kontuzjowany' },
          { name: 'Adam Nowak', position: 'Obrońca', shirtNumber: 3, healthStatus: 'Zdrowy' },
          { name: 'Piotr Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Górski', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Zdrowy' },
          { name: 'Marcin Kowalski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Szymon Nowak', position: 'Bramkarz', shirtNumber: 2, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Zawisza', position: 'Pomocnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Artur Kowalski', position: 'Napastnik', shirtNumber: 11, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Nowak', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 2,
        name: 'DP Meble',
        logo: undefined,
        players: [
          { name: 'Piotr Nowak', position: 'Bramkarz', shirtNumber: 12, healthStatus: 'Zdrowy' },
          { name: 'Marek Wiśniewski', position: 'Napastnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Wójcik', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Paweł Zieliński', position: 'Pomocnik', shirtNumber: 6, healthStatus: 'Zdrowy' },
          { name: 'Adam Kowalski', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' },
          { name: 'Marcin Górski', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Kontuzjowany' },
          { name: 'Szymon Piotrowski', position: 'Bramkarz', shirtNumber: 2, healthStatus: 'Zdrowy' },
          { name: 'Michał Nowak', position: 'Pomocnik', shirtNumber: 7, healthStatus: 'Kontuzjowany' },
          { name: 'Łukasz Nowak', position: 'Napastnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Zawisza', position: 'Obrońca', shirtNumber: 8, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 3,
        name: 'Tradycja Sarbicko',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 4,
        name: 'Orzeł Kawęczyn',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 5,
        name: 'Tur Turek',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 6,
        name: 'Oranje Konin',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 7,
        name: 'Tradycja Kiszewy',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 8,
        name: 'Modus',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 9,
        name: 'Tradycja Sarbicko',
        logo: undefined,
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 10,
        name: 'AKP Magros Konin',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 11,
        name: 'Nowe Holendry',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 12,
        name: 'OSP Tuliszków',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 13,
        name: 'Sokół Dąbie',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 14,
        name: 'RKN Konin',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR98XyRz__qMBiKHDJ9x3Rf795XGy41jYT-uw&s',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 15,
        name: 'Tradycja Sarbicko',
        logo: 'https://www.symbole.pl/wp-content/uploads/2020/10/logo-fc-barcelony.jpg',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 16,
        name: 'OSP Słodków',
        logo: 'https://www.sokolkleczew.pl/wp-content/themes/sokolkleczew/img/logofb.png',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 17,
        name: 'Transport Michalski',
        logo: undefined,
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 18,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 19,
        name: 'DP Meble',
        logo: undefined,
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 20,
        name: 'Stajnia Kuniccy',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_PwRy6Kx9DqJCU3Wy_Ww8P01wP5gg1pxpOw&s',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 20,
        name: 'Stajnia Kuniccy',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_PwRy6Kx9DqJCU3Wy_Ww8P01wP5gg1pxpOw&s',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 20,
        name: 'Stajnia Kuniccy',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_PwRy6Kx9DqJCU3Wy_Ww8P01wP5gg1pxpOw&s',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 20,
        name: 'Stajnia Kuniccy',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_PwRy6Kx9DqJCU3Wy_Ww8P01wP5gg1pxpOw&s',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },
      {
        id: 20,
        name: 'Stajnia Kuniccy',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_PwRy6Kx9DqJCU3Wy_Ww8P01wP5gg1pxpOw&s',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'Zdrowy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'Zdrowy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'Kontuzjowany' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'Zdrowy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'Zdrowy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'Kontuzjowany' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'Zdrowy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'Kontuzjowany' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'Zdrowy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'Zdrowy' }
        ]
      },

    ]
  }
}
