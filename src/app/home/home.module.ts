import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ComponentsBarComponent } from './components-bar/components-bar.component';
import { CanvasComponent } from './canvas/canvas.component';
import { StylesBarComponent } from './styles-bar/styles-bar.component';
import { TitlebarComponent } from './titlebar/titlebar.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    HomeComponent,
    ToolbarComponent,
    ComponentsBarComponent,
    CanvasComponent,
    StylesBarComponent,
    TitlebarComponent,
  ],
  imports: [CommonModule, SharedModule, HomeRoutingModule, FormsModule],
})
export class HomeModule {}
