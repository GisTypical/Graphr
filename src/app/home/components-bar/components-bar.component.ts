/* eslint-disable max-len */
import { CdkDragStart } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-components-bar',
  templateUrl: './components-bar.component.html',
  styleUrls: ['./components-bar.component.scss', '../home.component.scss'],
})
export class ComponentsBarComponent implements OnInit {
  @ViewChild('layout_dropdown') layoutDropdown: ElementRef;
  @ViewChild('text_dropdown') textDropdown: ElementRef;
  @ViewChild('forms_dropdown') formsDropdown: ElementRef;

  list = Array(15).fill('').map((_, i) => i + 1);
  isOpenLayout = false;
  isOpenText = false;
  isOpenForms = false;

  constructor() { }

  ngOnInit(): void { }

  toggleDetails(): boolean {
    this.isOpenLayout = this.layoutDropdown.nativeElement.hasAttribute('open');
    this.isOpenText = this.textDropdown.nativeElement.hasAttribute('open');
    this.isOpenForms = this.formsDropdown.nativeElement.hasAttribute('open');

    return this.isOpenLayout || this.isOpenText || this.isOpenForms;
  }
}
