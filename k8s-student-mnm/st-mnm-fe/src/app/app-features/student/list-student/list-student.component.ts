import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-list-student',
  templateUrl: './list-student.component.html',
  styleUrls: ['./list-student.component.css']
})
export class ListStudentComponent implements OnInit {

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.refreshData()
  }

  refreshData(){
    this.http.get<any[]>('/be/student/list').subscribe(data => {
      this.jsonData = data;
      console.log(this.jsonData);
    });
  }

  jsonData!: any[];
}
