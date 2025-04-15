import { Injectable } from '@angular/core';
import { Team } from '../models/team';

@Injectable({
  providedIn: 'root'
})

export class TeamService {
  constructor() {}
  getTeams(): Team[] {
    return [
      {
        id: 1,
        name: 'Stajnia Kuniccy',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_PwRy6Kx9DqJCU3Wy_Ww8P01wP5gg1pxpOw&s',
        players: [
          { name: 'Jan Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Marek Zieliński', position: 'Napastnik', shirtNumber: 9, healthStatus: 'injured' },
          { name: 'Adam Nowak', position: 'Obrońca', shirtNumber: 3, healthStatus: 'healthy' },
          { name: 'Piotr Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Tomasz Górski', position: 'Obrońca', shirtNumber: 5, healthStatus: 'healthy' },
          { name: 'Marcin Kowalski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Szymon Nowak', position: 'Bramkarz', shirtNumber: 2, healthStatus: 'injured' },
          { name: 'Dariusz Zawisza', position: 'Pomocnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Artur Kowalski', position: 'Napastnik', shirtNumber: 11, healthStatus: 'injured' },
          { name: 'Jakub Nowak', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 2,
        name: 'DP Meble',
        logo: 'https://yt3.googleusercontent.com/nnUt-yW5Y9hD7gVz18g8cobi3QIpsht3OBnO5e9trnJRe5nrs212CudWS6AdXNxjdgnimz7Kdw=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Piotr Nowak', position: 'Bramkarz', shirtNumber: 12, healthStatus: 'healthy' },
          { name: 'Marek Wiśniewski', position: 'Napastnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Tomasz Wójcik', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Paweł Zieliński', position: 'Pomocnik', shirtNumber: 6, healthStatus: 'healthy' },
          { name: 'Adam Kowalski', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' },
          { name: 'Marcin Górski', position: 'Napastnik', shirtNumber: 10, healthStatus: 'injured' },
          { name: 'Szymon Piotrowski', position: 'Bramkarz', shirtNumber: 2, healthStatus: 'healthy' },
          { name: 'Michał Nowak', position: 'Pomocnik', shirtNumber: 7, healthStatus: 'injured' },
          { name: 'Łukasz Nowak', position: 'Napastnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Tomasz Zawisza', position: 'Obrońca', shirtNumber: 8, healthStatus: 'healthy' }
        ]
      },
      {
        id: 3,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 4,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 5,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 6,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 7,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 8,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 9,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 10,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 11,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 12,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 13,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 14,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 15,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 16,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 17,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 18,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 19,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },
      {
        id: 20,
        name: 'Tradycja Sarbicko',
        logo: 'https://yt3.googleusercontent.com/3MuJZcfzJCWFim5oUnn-umt_9zxmt8Okb8IlT6zMEkWyjDMgxgETaU9jd2WZO434ZVbzWaTWFKo=s900-c-k-c0x00ffffff-no-rj',
        players: [
          { name: 'Krzysztof Kowalski', position: 'Bramkarz', shirtNumber: 1, healthStatus: 'healthy' },
          { name: 'Paweł Wiśniewski', position: 'Pomocnik', shirtNumber: 8, healthStatus: 'healthy' },
          { name: 'Marcin Nowak', position: 'Obrońca', shirtNumber: 6, healthStatus: 'injured' },
          { name: 'Jakub Wójcik', position: 'Napastnik', shirtNumber: 10, healthStatus: 'healthy' },
          { name: 'Tomasz Kowalski', position: 'Pomocnik', shirtNumber: 11, healthStatus: 'healthy' },
          { name: 'Piotr Zawisza', position: 'Obrońca', shirtNumber: 5, healthStatus: 'injured' },
          { name: 'Dariusz Piotrowski', position: 'Napastnik', shirtNumber: 7, healthStatus: 'healthy' },
          { name: 'Sebastian Nowak', position: 'Bramkarz', shirtNumber: 3, healthStatus: 'injured' },
          { name: 'Maciej Zieliński', position: 'Pomocnik', shirtNumber: 9, healthStatus: 'healthy' },
          { name: 'Łukasz Wójcik', position: 'Obrońca', shirtNumber: 4, healthStatus: 'healthy' }
        ]
      },

    ]
  }
}
