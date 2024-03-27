import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'student_management_frontend';

  createStudentActive = true;
  listStudentActive = false;
  
  showCreateStudent(){

    this.createStudentActive = true;
    this.listStudentActive = false;
  }

  showListStudent(){

    this.createStudentActive = false;
    this.listStudentActive = true;
  }
  
}
