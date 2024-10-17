import { Component, OnInit } from '@angular/core';
import { NgStyle, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, SpinnerComponent,FormSelectDirective } from '@coreui/angular';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet, Router } from '@angular/router'; 
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-form-controls',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: true,
    imports: [
      RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent,
      TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, ReactiveFormsModule,
      FormsModule, CommonModule, HttpClientModule, RouterOutlet, FormDirective, FormLabelDirective, FormControlDirective,
      ButtonDirective, NgStyle, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent,
      ModalTitleDirective, SpinnerComponent,FormSelectDirective,MatSnackBarModule
    ]
})
export class ProfileComponent implements OnInit {

    title = 'dropbox-app';
    
    users: any[] = [];
	
	public visible = false;
	editUserName: string = '';
	editUserEmail: string = '';
	editUserPhone: string = '';
	editUserPass: string = '';
	selectedUserId: string = '';
	buttontext: string = 'Update';
	
    constructor(private http: HttpClient, private router: Router, private snackBar: MatSnackBar) {
		
	}
    
	ngOnInit(): void {
		
		//const userType = localStorage.getItem('access_usertype');
		//const userdataString = localStorage.getItem('logged_userdata');
		this.selectedUserId = localStorage.getItem('logged_userid') || '';
		this.editUserName = localStorage.getItem('logged_username') || '';
		this.editUserEmail = localStorage.getItem('logged_useremail') || '';
		this.editUserPhone = localStorage.getItem('logged_userphone') || '';
		console.log(this.editUserName);
	}
	
	updateUser() {
		if (this.editUserName === '' || this.editUserPhone === '') {
		  return;
		}
		
		this.buttontext = 'wait...';
		this.visible = !this.visible;
		if(this.editUserPass != ''){
			
			this.http.put(`http://localhost:3000/users/${this.selectedUserId}`, {
			  name: this.editUserName,
			  password: this.editUserPass,
			  phone: this.editUserPhone
			}).subscribe(response => {
				localStorage.setItem('logged_username', this.editUserName);
				localStorage.setItem('logged_userphone', this.editUserPhone);
				
				this.buttontext = 'Update';
				this.visible = !this.visible;
		
				this.snackBar.open('Profile Updated!', 'Close', { duration: 2000 });
			});
		}else{
			
			this.http.put(`http://localhost:3000/users/${this.selectedUserId}`, {
			  name: this.editUserName,
			  phone: this.editUserPhone
			}).subscribe(response => {
				localStorage.setItem('logged_username', this.editUserName);
				localStorage.setItem('logged_userphone', this.editUserPhone);
				
				this.buttontext = 'Update';
				this.visible = !this.visible;
				this.snackBar.open('Profile Updated!', 'Close', { duration: 2000 });
			});
		}
		
	}
	
}
