import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-league-description',
  imports: [CommonModule],
  templateUrl: './league-description.component.html',
  styleUrls: ['./league-description.component.scss'],
  standalone: true
})

export class LeagueDescriptionComponent {
  description = `Halowa Liga Piłki Nożnej Toruń to coroczne wydarzenie sportowe, 
  które gromadzi drużyny z całego regionu. Edycja 2026 zapowiada się wyjątkowo emocjonująco 
  – ponad 20 zespołów, setki kibiców i pasja, która napędza każdą akcję na boisku.`;

  additionalInfo = `Wyniki, strzelcy bramek oraz szczegóły meczów będą uzupełniane na bieżąco po zakończeniu każdego meczu.
  Do zobaczenia na hali sportowej!`;
}
