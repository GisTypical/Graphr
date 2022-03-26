import { Component, OnInit } from '@angular/core';
import { SelectedElementsService } from '../../core/services/selected-elements/selected-elements.service';

@Component({
  selector: 'app-styles-bar',
  templateUrl: './styles-bar.component.html',
  styleUrls: ['./styles-bar.component.scss'],
})
export class StylesBarComponent implements OnInit {
  selectedElement: HTMLElement;

  constructor(private selectedService: SelectedElementsService) {
    this.selectedService.currentSelected.subscribe((value) => {
      this.selectedElement = value[value.length - 1];
      console.log(this.selectedElement);
    });
  }

  ngOnInit(): void {}

  isElementSelected() {
    return this.selectedElement !== undefined;
  }
}
