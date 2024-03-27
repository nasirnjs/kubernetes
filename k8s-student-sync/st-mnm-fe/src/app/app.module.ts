import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule  } from '@angular/common/http';

import { AppComponent } from './app.component';
// import { StudentComponent } from './app-features/student/student.component';
import { CreateStudentComponent } from './app-features/student/create-student/create-student.component';
import { ListStudentComponent } from './app-features/student/list-student/list-student.component';

@NgModule({
  declarations: [
    AppComponent,
    // StudentComponent,
    CreateStudentComponent,
    ListStudentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
