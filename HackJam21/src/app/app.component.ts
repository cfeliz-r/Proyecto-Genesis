import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameComponent } from './game/game.component';
import { LevelNavbarComponent } from "./level-navbar/level-navbar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'HackJam21';
}
