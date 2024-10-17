import { Component, OnInit } from '@angular/core';
import { NgStyle, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent, ModalTitleDirective, SpinnerComponent,FormSelectDirective } from '@coreui/angular';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet, Router } from '@angular/router'; 
import { Observable } from 'rxjs';

@Component({
    selector: 'app-form-controls',
    templateUrl: './userlist.component.html',
    styleUrls: ['./userlist.component.scss'],
    standalone: true,
    imports: [
      RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent,
      TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, ReactiveFormsModule,
      FormsModule, CommonModule, HttpClientModule, RouterOutlet, FormDirective, FormLabelDirective, FormControlDirective,
      ButtonDirective, NgStyle, ModalBodyComponent, ModalComponent, ModalFooterComponent, ModalHeaderComponent,
      ModalTitleDirective, SpinnerComponent,FormSelectDirective
    ]
})
export class UsersComponent implements OnInit {

    title = 'dropbox-app';
    
    userName: string = '';
    userEmail: string = '';
    userPhone: string = '';
	userPassword: string = '';
	userFolder: string = '';
	userType: string = 'photographer';
    
    public visible = false;
    public visible2 = false;
    buttontext = 'Add';
    
    users: any[] = [];
	
	editUserName: string = '';
	editUserEmail: string = '';
	editUserPhone: string = '';
	selectedUserId: string | null = null;

	public visibleEdit = false;
    
	folderslist: any[] = [];
	root_folderpath = '';
	
    constructor(private http: HttpClient, private router: Router) {
		const userType = localStorage.getItem('access_usertype');
		
		if (userType !== 'admin') {
			this.router.navigate(['/dashboard']);
		}
		const basefolder = localStorage.getItem('parent_folderpath');
		if(basefolder != null){
			this.root_folderpath = basefolder;
		}
		//this.getRootFolders();
	}
    
    ngOnInit() {
        this.fetchUsers();
    }
    
	getData(): Observable<any> {
		 
		const body = { basePath: this.root_folderpath };

		return this.http.post('http://localhost:3000/basefolder', body);
	}
  
	getRootFolders() {
		
		this.getData().subscribe(response => {
		  if(response.error){
			  
		  }else{
			
			this.folderslist = response.result.entries;
			console.log(response.result.entries);
		  }
		});
	}
	
    toggleLiveDemo() {
        this.visible = !this.visible;
    }

    handleLiveDemoChange(event: any) {
        this.visible = event;
    }
	
	toggleEditModal() {
		this.visibleEdit = !this.visibleEdit;
	}
	handleEditChange(event: any) {
        this.visibleEdit = event;
    }
	
    fetchUsers() {
        this.http.get('http://localhost:3000/users').subscribe((response: any) => {
            this.users = response;
        }, error => {
            console.error('Error fetching users:', error);
        });
    }

    createUser(){
		
        if(this.userName === '' || this.userEmail === '' || this.userPhone === '' || this.userPassword === ''){
            alert('Please fill in all required fields.');
            return;
        }
		//this.userFolderName = this.userName+this.userPhone;
        const userData = {
            name: this.userName,
            email: this.userEmail,
            phone: this.userPhone,
            userfolder: '',//this.userFolder,
            usertype: this.userType,
			password: this.userPassword
        };

        this.visible2 = true;
        this.buttontext = 'Please Wait...';

        this.http.post('http://localhost:3000/users', userData).subscribe((response: any) => {
            console.log('User created successfully:', response);
            this.visible = false;
            this.visible2 = false;
            this.buttontext = 'Add';

            this.userName = '';
            this.userEmail = '';
            this.userPhone = '';
			this.userPassword = '';

            this.fetchUsers();
        }, error => {
            console.error('Error creating user:', error);
            this.visible2 = false;
            this.buttontext = 'Add';
            alert(error.error.message);
        });
    }

    deleteUser(userId: string) {
        if(confirm('Are you sure you want to delete this user?')) {
            this.http.delete(`http://localhost:3000/users/${userId}`).subscribe((response: any) => {
                console.log('User deleted successfully:', response);
                this.fetchUsers();
            }, error => {
                console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again.');
            });
        }
    }
	
	editUser(user: any) {
		this.selectedUserId = user._id;
		this.editUserName = user.name;
		this.editUserEmail = user.email;
		this.editUserPhone = user.phone;
		this.visibleEdit = true;
	}

	updateUser() {
		if (this.editUserName === '' || this.editUserEmail === '' || this.editUserPhone === '') {
		  return;
		}

		this.http.put(`http://localhost:3000/users/${this.selectedUserId}`, {
		  name: this.editUserName,
		  email: this.editUserEmail,
		  phone: this.editUserPhone
		}).subscribe(response => {
		  this.onEditSuccess();
		});
	}
	
	onEditSuccess() {
		this.visibleEdit = false;
		this.fetchUsers();
		this.clearEditForm();
	}
	
	clearEditForm() {
		this.editUserName = '';
		this.editUserEmail = '';
		this.editUserPhone = '';
		this.selectedUserId = null;
	}

}
