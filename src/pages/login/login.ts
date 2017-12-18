import { HomePage } from '../home/home';
import { Dialogs } from '@ionic-native/dialogs';
import { Component } from '@angular/core';
import { NavController, AlertController, ViewController, LoadingController, Loading ,ToastController} from 'ionic-angular';
import { AuthService } from '../../providers/auth-service/auth-service';
import { Camera } from '@ionic-native/camera';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

// class for handling the login functionality
export class Login {

    public binaryImage: any;
    public faceIds: any;
    public faceData: any;
    public personId: any;
    public personData: any;
    public personDataStatus: any;
    islogged: any;
    logindata:any = [];
    login_data:any;
    logindetails:any=[];
    login_data_list:any = [];
    users: any;
    loading: Loading;
    branch_name:any;
    usercode:any;
    user_name:any;
    company_name:any;
    projectAndLocation_list:any;
    registerCredentials = { UserCode: '', 
                            UserPassword: '' };
    login_allowed=false;
    connected: Subscription;
    disconnected: Subscription;

    constructor(private nav: NavController,
                private toastCtrl: ToastController,
                private network: Network,
                private auth: AuthService, 
                private alertCtrl: AlertController, 
                public camera: Camera,
                public viewCtrl:ViewController,
                private dialogs: Dialogs,
                private loadingCtrl: LoadingController) { 
                    this.islogged =(localStorage.getItem('isLoggedIn'))
                    if(this.islogged){
                        this.registerCredentials.UserCode= (localStorage.getItem('userCode'))
                        this.registerCredentials.UserPassword= (localStorage.getItem('userPassword'))
                    }
        
    }

    ionViewDidEnter() {
        this.connected = this.network.onConnect().subscribe(data => {
          console.log(data)
          this.displayNetworkUpdate(data.type);
        }, error => console.error(error));
       
        this.disconnected = this.network.onDisconnect().subscribe(data => {
          console.log(data)
          this.displayNetworkUpdate(data.type);
        }, error => console.error(error));
      }
    
      ionViewWillLeave(){
        this.connected.unsubscribe();
        this.disconnected.unsubscribe();
      }
    
    
      displayNetworkUpdate(connectionState: string){
        let networkType = this.network.type;
        this.toastCtrl.create({
          message: `You are now ${connectionState} via ${networkType}`,
          position:'bottom',
          duration: 3000
        }).present();
      }

    // login() Method gets invoked on click of Login Button on the App
    public login() {
        // this.showLoading()
        this.loading = this.loadingCtrl.create({
            content:"Please wait......",
        })
        this.loading.present();
        // auth is the service provider and we pass the username and password to the auth.login() method 
        this.auth.login(this.registerCredentials).subscribe((data) => { 
        this.login_data = data;
        // Login is successful
        
        if(this.login_data.ResultNo == 1) {
            
            // EnableFaceRecognition is a boolean returned by the Server which indicates whether to 
            // enable face recognition or not
            console.log(this.login_data.EnableFaceRecognition ,"Inside Login");
            
            //hack
            // this.login_data.EnableFaceRecognition=false
            // console.log("Manual Disabling of Face Recognition")
            
            if(this.login_data.EnableFaceRecognition){
                console.log("FD enabled, so  taking picture")
                this.loading.dismiss();
                this.takePicture();
                console.log("picture taken")
                console.log("login allowed = ", this.login_allowed)
            }
            else{
                
                console.log("FD disabled, so not taking picture")
                   
                    // Use Local storage to remember user
                    localStorage.setItem('isLoggedIn', "true");
                    localStorage.setItem('userPassword', this.registerCredentials.UserPassword);

                    localStorage.setItem('userCode', this.registerCredentials.UserCode);
                    localStorage.setItem('userData', JSON.stringify(data));
                    this.loading.dismiss();
                    // Push to the next screen - HomePage. Pass project and location list
                    this.nav.push(HomePage, { projectAndLocation_list:this.login_data.ProjectDetails,
                                            company_name:this.login_data.CompanyName,
                                            user_name:this.login_data.FirstName, 
                                            designation_name:this.login_data.Designation,
                                            usercode:this.registerCredentials.UserCode,
                                            EnableFaceRecognition:this.login_data.EnableFaceRecognition
                                            
                                            }, { animate:true
                                            }
                                ).then(()=>{
                                            const index = this.viewCtrl.index;
                                            this.nav.remove(index);
                                        });
             }
             
        } else
            // Show error message
            this.showError("Invalid username or password! Please try again");
        },  error => {
            this.showError("Please check your network availability and try again!!!");
            }
        ); 
    }
    
    // Show Please Wait... loading info
    showLoading() {
        this.loading = this.loadingCtrl.create({
        content: 'Please wait...',
        dismissOnPageChange: true
        });
        this.loading.present();
    }

    // Show error message to user
    showError(text) {
        this.loading.dismiss();
        let alert = this.alertCtrl.create({
        title: 'Fail',
        subTitle: text,
        buttons: ['OK']
        });
        alert.present(prompt);
    }

    b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, {
                type: contentType
            });
            return blob;
    }

    // Function to take snap
    takePicture() {
        this.camera.getPicture({
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            saveToPhotoAlbum: true,
            correctOrientation: true
        }).then((imageData) => {
             this.loading = this.loadingCtrl.create({
            content:"Please wait......",
            })
            this.loading.present();
            // detect face
            console.log("Test");  
            console.log("imagedata = ", imageData);
            this.binaryImage = this.b64toBlob(imageData, "image/png", "");
            this.auth.detectFace(this.binaryImage).subscribe((data) => {
                console.log("detect face api data"+data);
                console.log("detect face api data length"+data.length);
                if(data.length==0 || data.length==null){
                     console.log("inside if");
                    // this.showError("Face not recognized / detected. Please try again");
                    this.loading.dismiss();
                    this.dialogs.alert("Face not recognized / detected. Please try again","Error","OK");
                     console.log("leaving if");
                    // this.nav.push(Login);
                     

                }
                //
                else{
                console.log("else of detect face",data[0].faceId);

                this.faceIds = [];
                this.faceIds.push(data[0].faceId);

                // identify face
                this.faceData = {
                    "personGroupId": "ckr_pg",
                    "faceIds": this.faceIds,
                    "maxNumOfCandidatesReturned": 1,
                    "confidenceThreshold": 0.5
                };
                this.auth.identifyFace(this.faceData).subscribe((data) => {
                    console.log("data[0].candidates.length =>"+data[0].candidates.length);
                     if(data[0].candidates.length == 0 || data[0].candidates.length == null){
                            this.showError("Invalid Face!!!!");
                        }
                        else {
                    // get person data
                    this.personId = data[0].candidates[0].personId;
                    this.auth.getPersonDetails(this.personId).subscribe((data) => {
                        // console.log(data);
                        this.personData = data;
                        this.personDataStatus = "true";
                        if(this.registerCredentials.UserCode==this.personData.userData.substring(6)){
                         
                           
                            // Use Local storage to remember user
                            localStorage.setItem('isLoggedIn', "true");
                            localStorage.setItem('userPassword', this.registerCredentials.UserPassword);
                            localStorage.setItem('userCode', this.registerCredentials.UserCode);
                            localStorage.setItem('userData', JSON.stringify(this.login_data));
                            this.loading.dismiss();
                            // Push to the next screen - HomePage. Pass project and location list
                            this.nav.push(HomePage, { projectAndLocation_list:this.login_data.ProjectDetails,
                                                    company_name:this.login_data.CompanyName,
                                                    user_name:this.login_data.FirstName, 
                                                    designation_name:this.login_data.Designation,
                                                    usercode:this.registerCredentials.UserCode,
                                                    EnableFaceRecognition:this.login_data.EnableFaceRecognition
                                                    
                                                    }, { animate:true
                                                    }
                                        ).then(()=>{
                                            const index = this.viewCtrl.index;
                                            this.nav.remove(index);
                                        })
                        }
                        else{
                           
                        this.showError("Supervisor Login Failed")
                            console.log("Supervisor login Failed")
                            this.login_allowed=false;
                            localStorage.clear();
                            this.nav.setRoot(Login);

                        }
                        
                    }, (error) => {
                        
                        console.log("identify error"+error);
                        this.personDataStatus = "false";
                        this.showError('Error occured while trying "Get person details". Please try later');
                       
                    });
                }
                }, (error) => {
                   
                    console.log("detect error"+error);
                    this.showError('Error occured while trying "Identify Face". Please try later');
                
                });
                }
            //
            }, (error) => {
                // this.loading.dismiss();
                console.log("recognition error"+error);
                this.showError('Error occured while trying "Detect face". Please try later');
               
            });
        }, (err) => {
   
            this.showError("Supervisor Login Failed")
        

        });
    }


  
}