import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-level-navbar',
  templateUrl: './level-navbar.component.html',
  styleUrls: ['./level-navbar.component.css']
})
export class LevelNavbarComponent {
  levels = [1, 2, 3, 4, 5]; // Puedes agregar más niveles

  @Output() levelSelected = new EventEmitter<number>();

  selectLevel(level: number) {
    this.levelSelected.emit(level);
  }
}
