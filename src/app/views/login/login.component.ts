import { Component } from '@angular/core';
import { NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective, AvatarComponent } from '@coreui/angular';

import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet, Router } from '@angular/router'; 
import { Observable } from 'rxjs';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: true,
    imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, IconDirective, FormControlDirective, ButtonDirective, NgStyle, FormsModule, HttpClientModule, RouterOutlet, AvatarComponent]
})
export class LoginComponent {

  userName = '';
  userPassword = '';
  autherr = '';
  constructor(private http: HttpClient, private router: Router) { }

  /*loginUser(){
	this.autherr = '';
    if(this.userName === '' || this.userPassword === ''){
      alert('Please enter correct input!');
      return;
    }
  
	this.http.post('http://localhost:3000/auth/login', { email: this.userName, password: this.userPassword }).subscribe((response: any) => {
		
			console.log(response);
	}, error => {
		console.error('Error creating user:', error);
		this.autherr = error.error.message;
		
	});
		
  }*/
  
  loginUser(){
    this.autherr = '';
    if(this.userName === '' || this.userPassword === ''){
      alert('Please enter correct input!');
      return;
    }

    this.http.post<{ access_token: string, parent_folderpath: any, access_usertype: any, userdata:any }>('http://localhost:3000/auth/login', { 
      email: this.userName, 
      password: this.userPassword 
    }).subscribe({
      next: (response) => {
        console.log(response.userdata.name);
        
        localStorage.setItem('access_token', response.access_token);
		localStorage.setItem('access_usertype', response.access_usertype);
		localStorage.setItem('parent_folderpath', response.parent_folderpath);
		localStorage.setItem('logged_userid', response.userdata._id);
		localStorage.setItem('logged_username', response.userdata.name);
		localStorage.setItem('logged_useremail', response.userdata.email);
		localStorage.setItem('logged_userphone', response.userdata.phone);
        
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        //console.error('Login error:', error);
        this.autherr = error.error.message || 'An error occurred during login.';
      }
    });	
  }
}
