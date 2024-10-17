import { Component } from '@angular/core';
import { HttpClient, HttpClientModule, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, ModalBodyComponent,ModalComponent,ModalFooterComponent,ModalHeaderComponent,ModalTitleDirective, SpinnerComponent } from '@coreui/angular';
import { NgStyle, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DocsExampleComponent } from '@docs-components/public-api';
import { RouterOutlet } from '@angular/router'; 
import { Observable, forkJoin, from, of, throwError, timer } from 'rxjs';
import { catchError, concatMap, map, mergeMap, tap, retryWhen, delay, scan } from 'rxjs/operators';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { brandSet, flagSet, freeSet } from '@coreui/icons';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
  
interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}


@Component({
  selector: 'app-dropbox',
  templateUrl: './dropboxlist.component.html',
  styleUrls: ['./dropboxlist.component.scss'],
  providers: [IconSetService],
  standalone: true,
  imports: [RowComponent, ColComponent, TextColorDirective, CardComponent, CardHeaderComponent, CardBodyComponent, DocsExampleComponent, TableDirective, TableColorDirective, TableActiveDirective, BorderDirective, AlignDirective, ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule, RouterOutlet, FormDirective, FormLabelDirective, FormControlDirective, ButtonDirective, NgStyle,ModalBodyComponent,ModalComponent,ModalFooterComponent, ModalHeaderComponent,ModalTitleDirective, SpinnerComponent, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatProgressBarModule]
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
	currentPath: { name: string; path: string }[] = [];
	//selectedFiles: File[] = [];
	selectedFiles: FileUpload[] = []; 
	
	public visible = false;
	public visible5 = false;
	public visible4 = false;
	public visible44 = false;
	public visible2 = false;
	public visible3 = false;
	buttontext = 'Create';
	buttontext2 = 'Upload File';
	 
	// Overall progress
	overallProgress: number = 0;
	
	// Counts for summary
	uploadedCount: number = 0;
	failedCount: number = 0;
	
	baseFolderName = '';
	logged_userid:any = '';
	logged_usertype:any = '';
	public allowverify = false;
	
	basefolder = '';

	constructor(
		private http: HttpClient,
		public iconSet: IconSetService,
		private snackBar: MatSnackBar
	) {
		
	//this.checkDropboxtoken();	
		
	/*	
    this.basefolder = localStorage.getItem('parent_folderpath') || '';
    //this.currentPath = [{ name: 'Root', path: this.basefolder }];
	const userType = localStorage.getItem('access_usertype');
		
	if (userType != 'admin') {
		
		if(this.basefolder == ''){
			this.createBaseFolder();
		}else{
			this.getRootFolders(this.basefolder);
		}
	}else{
		this.getRootFolders(this.basefolder);
	}
	*/
	this.logged_usertype = localStorage.getItem('access_usertype');
	
	if (this.logged_usertype != 'admin') {
		 this.allowverify = false;
	}else{
		 this.allowverify = true;
	}
	
	this.logged_userid = localStorage.getItem('logged_userid');
	
	this.currentPath = [{ name: 'Root', path: this.basefolder }];
    this.getRootFolders(this.basefolder);
	
	
	//console.log(this.currentPath[this.currentPath.length - 1].path);
	}
	
	verifyAccount(){
		window.location.href = 'http://localhost:3000/dropbox/auth';
	}
	
	checkDropboxtoken(){
		
		this.http.get('http://localhost:3000/dropbox/checktoken').subscribe(
		  (response: any) => {
			console.log(response);
		  },
		  (error) => {
			console.error(error);
			
		  }
		); 
	}
  
	createBaseFolder() {
    
		this.logged_userid = localStorage.getItem('logged_userid');
		const logged_username = localStorage.getItem('logged_username');
		const logged_userphone = localStorage.getItem('logged_userphone');
		
		const current = new Date();
		
		this.baseFolderName = `${logged_username} ${logged_userphone}-${current.getTime()}`;
		
		const body = { parentFolder: '', folderName: this.baseFolderName };
		this.http.post('http://localhost:3000/create-folder', body).subscribe(
		  (response: any) => {
			console.log('Folder created:', response);
			localStorage.setItem('parent_folderpath','/'+this.baseFolderName)
			
			this.basefolder = '/'+this.baseFolderName;
			this.updateUserFolder();
		  },
		  (error) => {
			console.error(error);
			//this.snackBar.open('Error creating folder', 'Close', { duration: 2000 });
			
		  }
		);
	}
	
	updateUserFolder() {
		this.http.put(`http://localhost:3000/users/${this.logged_userid}`, {
		  userfolder: this.baseFolderName,
		}).subscribe(response => {
			console.log(response);
			
			this.getRootFolders('/'+this.baseFolderName);
		});
	}
	
	navigateToPath(index: number, event: Event) {
	  event.preventDefault();
	  console.log(`Navigating to path index: ${index}`);

	  this.currentPath = this.currentPath.slice(0, index + 1);
	  const path = this.currentPath[index].path;
	  this.loadFolders(path);
	}

  openFolder(folder: any) {
    const newPath = `${this.currentPath[this.currentPath.length - 1].path}/${folder.name}`;
    this.currentPath.push({ name: folder.name, path: newPath });
    this.loadFolders(newPath);
  }

  loadFolders(path: string) {
    this.visible3 = true;
    const body = { basePath: path };
    this.http.post('http://localhost:3000/basefolder', body).subscribe(
      (response: any) => {
        if (response.error) {
          console.error(response.error);
          this.visible3 = false;
          this.snackBar.open('Error loading folders', 'Close', { duration: 2000 });
        } else {
          /*this.folderslist = response.result.entries.filter(
            (item: any) => item['.tag'] === 'folder'
          );
          this.subFoldersAndFiles = response.result;
          this.loadThumbnailsFromFiles(this.subFoldersAndFiles.files);*/
          
		  const userPrefix = `${this.logged_userid}_`;
		  
		  if (this.logged_usertype != 'admin') {
		  // Filter folders that start with the userPrefix
			this.folderslist = response.result.entries.filter(
				(item: any) => item['.tag'] === 'folder' && item.name.startsWith(userPrefix)
			).map((folder: any) => {
			  // Remove the prefix for display
			  return {
				...folder,
				name: folder.name.substring(userPrefix.length)
			  };
			});
			
		  }else{
			  this.folderslist = response.result.entries.filter(
				(item: any) => item['.tag'] === 'folder'
			).map((folder: any) => {
			  // Remove the prefix for display
			  return {
				...folder,
				name: folder.name.substring(userPrefix.length)
			  };
			});
		  }
		
		  this.folderslist = response.result.entries.filter((item: any) => item['.tag'] === 'folder');
		  
		  
		  this.subFoldersAndFiles = response.result.entries.filter((item: any) => item['.tag'] === 'file');
		  
		  this.loadThumbnailsFromFiles(this.subFoldersAndFiles)
		  
		  this.visible3 = false;
        }
      },
      (error) => {
        console.error(error);
        this.visible3 = false;
        this.snackBar.open('Error loading folders', 'Close', { duration: 2000 });
      }
    );
  }

  getRootFolders(basePath: string) {
    this.loadFolders(basePath);
  }

  loadThumbnailsFromFiles(files: any[]) {
    this.images = [];
    files.forEach(file => {
		
      if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.webp')) {
        const body = { imgPath: file.path_display };
        this.http.post('http://localhost:3000/thumbnails', body).subscribe(
          (response: any) => {
            if (response && response.fileBinary && response.fileBinary.data) {
              const binaryData = new Uint8Array(response.fileBinary.data);
              const blob = new Blob([binaryData], { type: 'image/png' });
              const imageUrl = URL.createObjectURL(blob);
              this.images.push(imageUrl);
			  
            } else {
              this.images.push('assets/default-thumbnail.png');
            }
          },
          (error) => {
            console.error('Error loading thumbnail for file:', file.name, error);
            this.images.push('assets/default-thumbnail.png');
          }
        );
      } else {
        // For non-image files, set a default thumbnail
        this.images.push('assets/default-thumbnail.png');
      }
    });
  }

  getFileThumbnail(file: any): string {
    const index = this.subFoldersAndFiles.files.indexOf(file);
    return this.images[index] || 'assets/default-thumbnail.png';
  }
  
  createFolder() {
    if (this.newPhotographerName == '' || this.newWeddingDate == '' || this.newProjectId == '') {
      this.snackBar.open('All fields are required', 'Close', { duration: 2000 });
      return;
    }
    this.visible2 = true;
    this.buttontext = 'Please Wait...';

    this.newFolderName = `${this.logged_userid}_${this.newPhotographerName} ${this.newWeddingDate} ${this.newProjectId}`;
    const parentFolder = this.currentPath[this.currentPath.length - 1].path;

    const body = { parentFolder: parentFolder, folderName: this.newFolderName };
    this.http.post('http://localhost:3000/create-folder', body).subscribe(
      (response: any) => {
        //console.log('Folder created:', response);
        this.refreshCurrentFolder();
        this.buttontext = 'Create';
        this.visible = false;
        this.visible2 = false;
        // Reset form fields
        this.newPhotographerName = '';
        this.newWeddingDate = '';
        this.newProjectId = '';
      },
      (error) => {
        //console.error(error);
        this.snackBar.open('Error creating folder', 'Close', { duration: 2000 });
        this.buttontext = 'Create';
        this.visible2 = false;
      }
    );
  }

  createSubFolder() {
    if (this.newPhotographerName == '' || this.newWeddingDate == '' || this.newProjectId == '') {
      this.snackBar.open('All fields are required', 'Close', { duration: 2000 });
      return;
    }
    this.visible2 = true;
    this.buttontext = 'Please Wait...';

    this.newFolderName = `${this.logged_userid}_${this.newPhotographerName} ${this.newWeddingDate} ${this.newProjectId}`;
    const parentFolder = this.selectedfolder || this.currentPath[this.currentPath.length - 1].path;

    const body = { parentFolder: parentFolder, folderName: this.newFolderName };
    this.http.post('http://localhost:3000/create-folder', body).subscribe(
      (response: any) => {
        //console.log('Folder created:', response);
        this.refreshCurrentFolder();
        this.buttontext = 'Create';
        this.visible2 = false;
        this.visible5 = false;
        // Reset form fields
        this.newPhotographerName = '';
        this.newWeddingDate = '';
        this.newProjectId = '';
      },
      (error) => {
        //console.error(error);
        this.snackBar.open('Error creating subfolder', 'Close', { duration: 2000 });
        this.buttontext = 'Create';
        this.visible2 = false;
      }
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      this.visible44 = true;
      this.buttontext2 = 'Uploading...';

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('uploadFolder', this.currentPath[this.currentPath.length - 1].path);

      this.http.post('http://localhost:3000/upload-file', formData).subscribe(
        (response: any) => {
          //console.log('File uploaded:', response);
          this.buttontext2 = 'Upload File';
          this.visible44 = false;
          this.visible4 = false;
          this.refreshCurrentFolder();
        },
        (error) => {
          //console.error('Error uploading file:', error);
          this.snackBar.open('Error uploading file', 'Close', { duration: 2000 });
          this.buttontext2 = 'Upload File';
          this.visible44 = false;
        }
      );
    } else {
      this.snackBar.open('No file selected', 'Close', { duration: 2000 });
    }
  }
  
  
	/*onFilesSelected_old(event: any) {
		const files: FileList = event.target.files;
		if (files.length > 0) {
		  this.selectedFiles = Array.from(files);
		} else {
		  this.selectedFiles = [];
		}
	}

	uploadFiles_old() {
		if (this.selectedFiles.length > 0) {
		  this.visible44 = true;
		  this.buttontext2 = 'Uploading...';

		  const formData = new FormData();
		  this.selectedFiles.forEach((file:any) => {
			formData.append('files', file, file.name);
		  });
		  formData.append('uploadFolder', this.currentPath[this.currentPath.length - 1].path);

		  this.http.post('http://localhost:3000/upload-files', formData).subscribe(
			(response: any) => {
			  console.log('Files uploaded:', response);
			  this.snackBar.open('Files uploaded successfully', 'Close', { duration: 3000 });
			  this.buttontext2 = 'Upload Files';
			  this.visible44 = false;
			  this.visible4 = false;
			  this.refreshCurrentFolder();
			  this.selectedFiles = []; // Clear selected files
			},
			(error) => {
			  console.error('Error uploading files:', error);
			  this.snackBar.open('Error uploading files', 'Close', { duration: 3000 });
			  this.buttontext2 = 'Upload Files';
			  this.visible44 = false;
			}
		  );
		} else {
		  this.snackBar.open('No files selected', 'Close', { duration: 2000 });
		}
	}*/
	
	onFilesSelected(event: any) {
		const files: FileList = event.target.files;
		
		if (files.length > 0) {
		  this.selectedFiles = Array.from(files).map(file => ({
			file,
			progress: 0,
			status: 'pending'
		  }));
		} else {
		  this.selectedFiles = [];
		}
		
		console.log(this.selectedFiles);
	}
 /*
	uploadFiles() {
		if (this.selectedFiles.length > 0) {
		  //this.visible44 = true;
		  this.buttontext2 = 'Uploading...';
		  this.overallProgress = 0;
		  
		  // Show the upload progress modal
		  this.toggleUploadProgressModal();
		
		  // Limit the number of concurrent uploads
		  const maxConcurrency = 5; // Adjust based on performance and rate limits
		  
		  // Create an observable stream of file uploads with controlled concurrency
		  const uploadObservables = this.selectedFiles.map((fileUpload, index) => {
			return this.uploadSingleFile(fileUpload, index);
		  });
		  
		  // Use forkJoin to wait for all uploads to complete
		  forkJoin(uploadObservables).subscribe(
			(results) => {
			  //console.log('All uploads complete:', results);
			  this.snackBar.open('All files have been processed.', 'Close', { duration: 3000 });
			  this.buttontext2 = 'Upload Files';
			  //this.visible44 = false;
			  this.visible4 = false;
			  this.refreshCurrentFolder();
			  // Optionally, keep the status of files for user reference
			},
			(error) => {
			  //console.error('Error during uploads:', error);
			  this.snackBar.open('Error uploading files', 'Close', { duration: 3000 });
			  this.buttontext2 = 'Upload Files';
			  //this.visible44 = false;
			}
		  );
		} else {
		  this.snackBar.open('No files selected', 'Close', { duration: 2000 });
		}
	}*/
	
	
	/*
	uploadFiles() {
	  if (this.selectedFiles.length > 0) {
		this.buttontext2 = 'Uploading...';
		this.overallProgress = 0;

		// Show the upload progress modal
		this.toggleUploadProgressModal();

		// Create an observable stream of file uploads, ensuring sequential execution with a delay
		from(this.selectedFiles)
		  .pipe(
			concatMap((fileUpload, index) =>
			  of(fileUpload).pipe(
				delay(2000), // Add a 2-second delay before each upload starts
				concatMap(() => this.uploadSingleFile(fileUpload, index))
			  )
			)
		  )
		  .subscribe(
			(result) => {
			  console.log('File uploaded:', result);
			},
			(error) => {
			  console.error('Error uploading files:', error);
			  this.snackBar.open('Error uploading files', 'Close', { duration: 3000 });
			  this.buttontext2 = 'Upload Files';
			},
			() => {
			  this.snackBar.open('All files have been processed.', 'Close', { duration: 3000 });
			  this.buttontext2 = 'Upload Files';
			  this.visible4 = false;
			  this.refreshCurrentFolder();
			}
		  );
	  } else {
		this.snackBar.open('No files selected', 'Close', { duration: 2000 });
	  }
	}
	*/

	
	// Upload multiple files with concurrency control
	/*uploadFiles() {
		if (this.selectedFiles.length > 0) {
		  this.buttontext2 = 'Uploading...';
		  this.overallProgress = 0;
		  this.uploadedCount = 0;
		  this.failedCount = 0;

		  // Show the upload progress modal
		  this.toggleUploadProgressModal();

		  // Reset statuses for all files before starting upload
		  this.selectedFiles.forEach(fileUpload => {
			if (fileUpload.status !== 'success') {
			  fileUpload.progress = 0;
			  fileUpload.status = 'pending';
			  fileUpload.error = undefined;
			}
		  });

		  // Define the number of concurrent uploads
		  const concurrentUploads = 5; // Adjust based on server capacity

		  from(this.selectedFiles)
			.pipe(
			  mergeMap((fileUpload, index) => {
				if (fileUpload.status === 'success') {
				  // Skip already uploaded files
				  return of(fileUpload);
				}
				return this.uploadSingleFile(fileUpload, index);
			  }, concurrentUploads)
			)
			.subscribe(
			  () => {
				// No action needed on individual file completion
			  },
			  (error) => {
				console.error('Error uploading files:', error);
				this.snackBar.open('Error uploading files', 'Close', { duration: 3000 });
				this.buttontext2 = 'Upload Files';
			  },
			  () => {
				// Calculate counts
				this.uploadedCount = this.selectedFiles.filter(f => f.status === 'success').length;
				this.failedCount = this.selectedFiles.filter(f => f.status === 'error').length;

				if (this.failedCount > 0) {
				  this.snackBar.open(`${this.failedCount} file(s) failed to upload.`, 'Close', { duration: 3000 });
				} else {
				  this.snackBar.open('All files uploaded successfully.', 'Close', { duration: 3000 });
				}

				this.buttontext2 = 'Upload Files';
				//this.visible44 = false;
				this.refreshCurrentFolder();
			  }
			);
		} else {
		  this.snackBar.open('No files selected', 'Close', { duration: 2000 });
		}
	}*/
	
	 uploadFiles() {
		if (this.selectedFiles.length > 0) {
			console.log(this.selectedFiles);
		  this.buttontext2 = 'Uploading...';
		  this.overallProgress = 0;
		  this.uploadedCount = 0;
		  this.failedCount = 0;

		  // Show the upload progress modal
		  this.toggleUploadProgressModal();
		  console.log(this.selectedFiles.length);

		  // Reset statuses for all files before starting upload
		  this.selectedFiles.forEach(fileUpload => {
			if (fileUpload.status !== 'success') {
			  fileUpload.progress = 0;
			  fileUpload.status = 'pending';
			  fileUpload.error = undefined;
			}
		  });

		  from(this.selectedFiles)
			.pipe(
			  // Use concatMap to handle uploads sequentially
			  concatMap((fileUpload, index) => {
				if (fileUpload.status === 'success') {
				  // Skip already uploaded files
				  return of(fileUpload);
				}
				return this.uploadSingleFile(fileUpload, index).pipe(
				  // Introduce a 1-second delay after each upload
				  concatMap(() => timer(1000))
				);
			  })
			)
			.subscribe(
			  () => {
				// No action needed on individual file completion
			  },
			  (error) => {
				console.error('Error uploading files:', error);
				this.snackBar.open('Error uploading files', 'Close', { duration: 3000 });
				this.buttontext2 = 'Upload Files';
			  },
			  () => {
				// Calculate counts
				this.uploadedCount = this.selectedFiles.filter(f => f.status === 'success').length;
				this.failedCount = this.selectedFiles.filter(f => f.status === 'error').length;

				if (this.failedCount > 0) {
				  this.snackBar.open(`${this.failedCount} file(s) failed to upload.`, 'Close', { duration: 3000 });
				} else {
				  this.snackBar.open('All files uploaded successfully.', 'Close', { duration: 3000 });
				}

				this.buttontext2 = 'Upload Files';
				//this.visible44 = false;
				this.refreshCurrentFolder();
			  }
			);
		} else {
		  this.snackBar.open('No files selected', 'Close', { duration: 2000 });
		}
	  }

	toggleUploadProgressModal() {
		this.visible44 = !this.visible44;
		this.visible4 = !this.visible4;
		
		//this.selectedFiles = [];
	}

	handleUploadProgressChange(event: any) {
		this.visible44 = event;
	}
 
 /*
	uploadSingleFile(fileUpload: FileUpload, index: number): Observable<any> {
		const formData = new FormData();
		formData.append('files', fileUpload.file, fileUpload.file.name);
		formData.append('uploadFolder', this.currentPath[this.currentPath.length - 1].path);
		
		const req = new HttpRequest('POST', 'http://localhost:3000/upload-files', formData, {
		  reportProgress: true
		});
		
		// Update status to uploading
		fileUpload.status = 'uploading';
		
		return this.http.request(req).pipe(
		  map(event => this.getEventMessage(event, fileUpload, index)),
		  tap((progress:any) => {
			if (progress.type === 'progress') {
			  // Update individual file progress
			  fileUpload.progress = progress.progress;
			  this.updateOverallProgress();
			} else if (progress.type === 'success') {
			  fileUpload.status = 'success';
			  fileUpload.progress = 100;
			  this.updateOverallProgress();
			} else if (progress.type === 'error') {
			  fileUpload.status = 'error';
			  fileUpload.error = progress.message;
			  this.updateOverallProgress();
			}
		  }),
		  catchError(error => {
			fileUpload.status = 'error';
			fileUpload.error = error.message;
			this.updateOverallProgress();
			return of({}); // Continue the stream
		  })
		);
	}
	*/
	
	// Upload a single file and update its status
	uploadSingleFile(fileUpload: FileUpload, index: number): Observable<any> {
	  const formData = new FormData();
	  formData.append('files', fileUpload.file, fileUpload.file.name);
	  formData.append('uploadFolder', this.currentPath[this.currentPath.length - 1].path);
	  
	  const req = new HttpRequest('POST', 'http://localhost:3000/upload-files', formData, {
		reportProgress: true
	  });
	  
	  fileUpload.status = 'uploading';
	  
	  return this.http.request(req).pipe(
		map(event => this.getEventMessage(event, fileUpload, index)),
		tap((progress: any) => {
		  if (progress.type === 'progress') {
			// Update individual file progress
			fileUpload.progress = progress.progress;
			this.updateOverallProgress();
		  } else if (progress.type === 'success') {
			// Check the status in the response body
			if (progress.body && progress.body.results && progress.body.results.length > 0) {
			  const fileResult = progress.body.results[0];
			  if (fileResult.status === 'success') {
				fileUpload.status = 'success';
				fileUpload.progress = 100;
				this.uploadedCount += 1;
			  } else if (fileResult.status === 'error') {
				fileUpload.status = 'error';
				fileUpload.error = fileResult.details || 'Unknown error';
				this.failedCount += 1;
			  }
			} else {
			  // If response structure is unexpected, mark as error
			  fileUpload.status = 'error';
			  fileUpload.error = 'Invalid server response';
			  this.failedCount += 1;
			}
			this.updateOverallProgress();
		  } else if (progress.type === 'error') {
			fileUpload.status = 'error';
			fileUpload.error = progress.message;
			this.failedCount += 1;
			this.updateOverallProgress();
		  }
		}),
		catchError(error => {
		  fileUpload.status = 'error';
		  fileUpload.error = error.message || 'Upload failed';
		  
		  this.failedCount += 1;
		  this.updateOverallProgress();
		  return of({}); // Continue the stream
		})
	  );
	}


 
	private getEventMessage(event: HttpEvent<any>, fileUpload: FileUpload, index: number) {
		switch (event.type) {
		  case HttpEventType.Sent:
			return { type: 'sent' };
		  case HttpEventType.UploadProgress:
			const percentDone = Math.round(100 * event.loaded / (event.total || 1));
			return { type: 'progress', progress: percentDone };
		  case HttpEventType.Response:
			return { type: 'success', body: event.body };
		  default:
			return { type: 'unknown' };
		}
	}
 
	private updateOverallProgress2() {
		const total = this.selectedFiles.length;
		const uploaded = this.selectedFiles.filter(f => f.progress === 100).length;
		this.overallProgress = Math.round((uploaded / total) * 100);
	}
 
	retryUpload2(fileUpload: FileUpload, index: number) {
		this.uploadSingleFile(fileUpload, index).subscribe();
	}
	
	
	  // Update the overall progress based on individual file statuses
  private updateOverallProgress() {
    const total = this.selectedFiles.length;
    const uploaded = this.selectedFiles.filter(f => f.status === 'success').length;
    const uploading = this.selectedFiles.filter(f => f.status === 'uploading').length;
    this.overallProgress = Math.round(((uploaded + uploading) / total) * 100);
  }

  // Retry uploading a single failed file
  /*
  retryUpload(fileUpload: FileUpload, index: number) {
    this.uploadSingleFile(fileUpload, index).subscribe(
      () => {
        // File upload handled in uploadSingleFile
      },
      (error) => {
        console.error('Error retrying file upload:', error);
        this.snackBar.open('Error retrying file upload.', 'Close', { duration: 2000 });
      },
      () => {
        // Update counts after retry
        this.uploadedCount = this.selectedFiles.filter(f => f.status === 'success').length;
        this.failedCount = this.selectedFiles.filter(f => f.status === 'error').length;

        if (this.failedCount > 0) {
          this.snackBar.open(`${this.failedCount} file(s) failed to upload again.`, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('All failed files uploaded successfully.', 'Close', { duration: 3000 });
        }

        this.buttontext2 = 'Retry All';
      }
    );
  }

  // Retry all failed uploads at once
  retryAllFailed() {
    const failedUploads = this.selectedFiles.filter(f => f.status === 'error');
    if (failedUploads.length === 0) {
      this.snackBar.open('No failed uploads to retry.', 'Close', { duration: 2000 });
      return;
    }

    this.buttontext2 = 'Retrying...';
    this.overallProgress = 0;
    this.uploadedCount = 0;
    this.failedCount = 0;

    // Reset statuses for failed files before retrying
    failedUploads.forEach(fileUpload => {
      fileUpload.progress = 0;
      fileUpload.status = 'pending';
      fileUpload.error = undefined;
    });

    // Define the number of concurrent uploads
    const concurrentUploads = 5; // Adjust based on server capacity

    from(failedUploads)
      .pipe(
        mergeMap((fileUpload, index) => this.uploadSingleFile(fileUpload, index), concurrentUploads)
      )
      .subscribe(
        () => {
          // No action needed on individual file completion
        },
        (error) => {
          console.error('Error retrying uploads:', error);
          this.snackBar.open('Error retrying uploads.', 'Close', { duration: 3000 });
          this.buttontext2 = 'Retry All';
        },
        () => {
          // Calculate counts
          this.uploadedCount += failedUploads.filter(f => f.status === 'success').length;
          this.failedCount += failedUploads.filter(f => f.status === 'error').length;

          if (this.failedCount > 0) {
            this.snackBar.open(`${this.failedCount} file(s) failed to upload again.`, 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('All failed files uploaded successfully.', 'Close', { duration: 3000 });
          }

          this.buttontext2 = 'Retry All';
          //this.visible44 = false;
          this.refreshCurrentFolder();
        }
      );
  }
*/

	// Retry uploading a single failed file with delay
  retryUpload(fileUpload: FileUpload, index: number) {
    this.uploadSingleFile(fileUpload, index).pipe(
      // Introduce a 1-second delay after retry
      concatMap(() => timer(1000))
    ).subscribe(
      () => {
        // File upload handled in uploadSingleFile
      },
      (error) => {
        console.error('Error retrying file upload:', error);
        this.snackBar.open('Error retrying file upload.', 'Close', { duration: 2000 });
      },
      () => {
        // Update counts after retry
        this.uploadedCount = this.selectedFiles.filter(f => f.status === 'success').length;
        this.failedCount = this.selectedFiles.filter(f => f.status === 'error').length;

        if (this.failedCount > 0) {
          this.snackBar.open(`${this.failedCount} file(s) failed to upload again.`, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('All failed files uploaded successfully.', 'Close', { duration: 3000 });
        }

        this.buttontext2 = 'Retry All';
      }
    );
  }

  // Retry all failed uploads at once with delays
	retryAllFailed() {
		const failedUploads = this.selectedFiles.filter(f => f.status === 'error');
		if (failedUploads.length === 0) {
		  this.snackBar.open('No failed uploads to retry.', 'Close', { duration: 2000 });
		  return;
		}

		this.buttontext2 = 'Retrying...';
		this.overallProgress = 0;
		this.uploadedCount = 0;
		this.failedCount = 0;

		// Reset statuses for failed files before retrying
		failedUploads.forEach(fileUpload => {
		  fileUpload.progress = 0;
		  fileUpload.status = 'pending';
		  fileUpload.error = undefined;
		});

		from(failedUploads)
		  .pipe(
			// Use concatMap to handle uploads sequentially
			concatMap((fileUpload, index) => this.uploadSingleFile(fileUpload, index).pipe(
			  // Introduce a 1-second delay after each upload
			  concatMap(() => timer(1000))
			))
		  )
		  .subscribe(
			() => {
			  // No action needed on individual file completion
			},
			(error) => {
			  console.error('Error retrying uploads:', error);
			  this.snackBar.open('Error retrying uploads.', 'Close', { duration: 3000 });
			  this.buttontext2 = 'Retry All';
			},
			() => {
			  // Calculate counts
			  this.uploadedCount += failedUploads.filter(f => f.status === 'success').length;
			  this.failedCount += failedUploads.filter(f => f.status === 'error').length;

			  if (this.failedCount > 0) {
				this.snackBar.open(`${this.failedCount} file(s) failed to upload again.`, 'Close', { duration: 3000 });
			  } else {
				this.snackBar.open('All failed files uploaded successfully.', 'Close', { duration: 3000 });
			  }

			  this.buttontext2 = 'Retry All';
			  //this.visible44 = false;
			  this.refreshCurrentFolder();
			}
		  );
	}
  
	refreshCurrentFolder() {
		const currentPath = this.currentPath[this.currentPath.length - 1].path;
		this.loadFolders(currentPath);
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

}
