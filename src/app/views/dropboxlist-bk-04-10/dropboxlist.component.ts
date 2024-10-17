import { Component } from '@angular/core';
import { NgStyle, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DocsExampleComponent } from '@docs-components/public-api';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, ModalBodyComponent,ModalComponent,ModalFooterComponent,ModalHeaderComponent,ModalTitleDirective, SpinnerComponent } from '@coreui/angular';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router'; 
import { Observable } from 'rxjs';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { brandSet, flagSet, freeSet } from '@coreui/icons';

@Component({
    selector: 'app-tables',
    templateUrl: './dropboxlist.component.html',
    styleUrls: ['./dropboxlist.component.scss'],
    standalone: true,
	providers: [IconSetService],
    imports: [RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule, RouterOutlet, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, NgStyle,ModalBodyComponent,ModalComponent,ModalFooterComponent, ModalHeaderComponent,ModalTitleDirective, SpinnerComponent,IconDirective]
	
})
export class DropboxComponent {
	
	title = 'dropbox-app';
	folderslist: any[] = [];
	subFoldersAndFiles: any = {};
	newFolderName: string = '';
	newPhotographerName: string = '';
	newWeddingDate: string = '';
	newProjectId: string = '';
	selectedFile: File | null = null;
	images: any[] = [];
	parentFolderName = '';
	root_folderpath = '';
	selectedfolder = '';
	uploadtofolder = '';
  
	public visible = false;
	public visible5 = false;
	public visible4 = false;
	public visible44 = false;
	public visible2 = false;
	public visible3 = false;
	buttontext = 'Create';
	buttontext2 = 'Upload File';
  
	constructor(private http: HttpClient, public iconSet: IconSetService) { 
	
		const userType = localStorage.getItem('access_usertype');
		const basefolder = localStorage.getItem('parent_folderpath');
		if(basefolder != null){
			this.root_folderpath = basefolder;
			this.parentFolderName = basefolder;
		}
		this.getRootFolders();
	}
	
	toggleLiveDemo() {
		this.visible = !this.visible;
	}

	handleLiveDemoChange(event: any) {
		this.visible = event;
	}
	
	toggleLiveDemo3(selectedfolder: any) {
		this.selectedfolder = selectedfolder;
		this.visible5 = !this.visible5;
	}

	handleLiveDemoChange3(event: any) {
		this.visible5 = event;
	}
	
	toggleLiveDemo2() {
		this.visible4 = !this.visible4;
	}

	uploadFile2(uploadpath: any) {
		this.uploadtofolder = uploadpath;
		this.visible4 = !this.visible4;
	}
	
	handleLiveDemoChange2(event: any) {
		this.visible4 = event;
	}
	
	/*getData(): Observable<any> {
		return this.http.get('http://localhost:3000/');
	}*/
	
	getData(): Observable<any> { 
		const body = { basePath: this.root_folderpath };
		return this.http.post('http://localhost:3000/basefolder', body);
	}
  
	getRootFolders() {
		this.visible3 = !this.visible3;
		this.getData().subscribe(response => {
		  if(response.error){
			  console.log(response.error);
			  this.visible3 = !this.visible3;
		  }else{
			this.visible3 = !this.visible3;
			//this.folderslist = response.result.entries;
			
			this.folderslist = response.result.entries.filter((item: { [key: string]: any }) => item['.tag'] === 'folder');
		  }
		});
	}
  
	loadSubFolder(folderPath: string) {
		//this.parentFolderName = folderPath;
		const body = { folderPath: folderPath };

		this.http.post('http://localhost:3000/subfolder', body).subscribe((response: any) => {
		  this.subFoldersAndFiles = response;
		  this.loadThumbnailsFromFiles(response.files);
		});
	}
  
	loadThumbnailsFromFiles(files: any[]) {
		this.images = [];
		files.forEach(file => {
		  if (file.name.endsWith('.png') || file.name.endsWith('.jpg')) {
			  console.log(file.name);
			const body = { imgPath: file.path_display };
			this.http.post('http://localhost:3000/thumbnails', body).subscribe((response: any) => {
			  if (response && response.fileBinary && response.fileBinary.data) {
				const binaryData = new Uint8Array(response.fileBinary.data);
				const blob = new Blob([binaryData], { type: 'image/png' });
				const imageUrl = URL.createObjectURL(blob);
				this.images.push(imageUrl);
			  }
			});
		  }
		});
	}
  
	loadThumbnails() {
		const path_display = '/abc/Frame.png';
		const body = { imgPath: path_display };
		this.http.post('http://localhost:3000/thumbnails', body).subscribe((response: any) => {
			if (response && response.fileBinary && response.fileBinary.data) {
			  const binaryData = new Uint8Array(response.fileBinary.data);
			  const blob = new Blob([binaryData], { type: 'image/png' });
			  const imageUrl = URL.createObjectURL(blob);

			  this.images.push(imageUrl);
			  console.log(this.images);
			}
		}, error => {
			console.error('Error loading thumbnail:', error);
		});
	}
  
	createFolder() {
		
		if(this.newPhotographerName == '' || this.newWeddingDate == '' || this.newProjectId == ''){
			return;
		}
		this.visible2 = !this.visible2;
		this.buttontext = 'Please Wait...';
		
		this.newFolderName = this.newPhotographerName+' '+this.newWeddingDate+' '+this.newProjectId;
		
		const body = { parentFolder: this.parentFolderName, folderName: this.newFolderName };
		this.http.post('http://localhost:3000/create-folder', body).subscribe(response => {
		  console.log('Folder created:', response);
		  
		  this.getData().subscribe((updatedResponse) => {
			//this.folderslist = updatedResponse;
			if(updatedResponse.error){
			  
			}else{
				this.newPhotographerName == '';
				this.newWeddingDate == '';
				this.newProjectId == '';
				this.folderslist = updatedResponse.result.entries;
			}
			
			this.buttontext = 'Create';
			this.visible = !this.visible;
			this.visible2 = !this.visible2;
		  });
		});
	}
	
	createSubFolder() {
		
		if(this.newPhotographerName == '' || this.newWeddingDate == '' || this.newProjectId == ''){
			return;
		}
		this.visible2 = !this.visible2;
		this.buttontext = 'Please Wait...';
		
		this.newFolderName = this.newPhotographerName+' '+this.newWeddingDate+' '+this.newProjectId;
		
		const body = { parentFolder: this.selectedfolder, folderName: this.newFolderName };
		this.http.post('http://localhost:3000/create-folder', body).subscribe(response => {
		  console.log('Folder created:', response);
		  
		  this.getData().subscribe((updatedResponse) => {
			//this.folderslist = updatedResponse;
			if(updatedResponse.error){
			  
			}else{
				this.newPhotographerName == '';
				this.newWeddingDate == '';
				this.newProjectId == '';
				this.folderslist = updatedResponse.result.entries;
			}
			
			this.buttontext = 'Create';
			this.visible2 = !this.visible2;
			this.visible5 = !this.visible5;
		  });
		});
	}
  
	onFileSelected(event: any) {
		this.selectedFile = event.target.files[0];
	}

	uploadFile() {
		if (this.selectedFile) {
		  this.visible44 = !this.visible44;
		  this.buttontext2 = 'Uploading...';
		
		  const formData = new FormData();
		  formData.append('file', this.selectedFile);
		  formData.append('uploadFolder', this.uploadtofolder);

		  this.http.post('http://localhost:3000/upload-file', formData).subscribe(response => {
			console.log('File uploaded:', response);
			
			this.buttontext2 = 'Upload File';
			this.visible44 = !this.visible44;
			this.visible4 = !this.visible4;
			
		  });
		} else {
		  alert('No file selected');
		}
	}
}
