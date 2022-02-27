import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class DetailComponent implements OnInit {
  test = {
    something: '',
  };

  constructor() {}

  ngOnInit(): void {
    console.log('DetailComponent INIT');
    console.log(this.test?.something);
  }
}
