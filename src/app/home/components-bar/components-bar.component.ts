import { CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-components-bar',
  templateUrl: './components-bar.component.html',
  styleUrls: ['./components-bar.component.scss', '../home.component.scss'],
})
export class ComponentsBarComponent implements OnInit {
  list = Array(15).fill('').map((_, i) => i + 1);

  constructor() { }

  ngOnInit(): void { }

  something(event: CdkDragStart<any>) {
    console.log('something', event);
  }
}
