import { Component } from '@angular/core';
import { HelloCanvas } from './hello-canvas/hello-canvas';

@Component({
  selector: 'app-root',
  imports: [HelloCanvas],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
