import { Component } from '@angular/core';
import { NavController,ViewController, NavParams, Platform,ModalController, LoadingController , AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../providers/auth-service/auth-service';
import { File } from '@ionic-native/file';
import { Http } from '@angular/http';
import { ConfirmSubmissionPage } from '../confirm-submission/confirm-submission';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';

@Component({
    selector: 'page-take-attendance',
    templateUrl: 'take-attendance.html',
})


// functionality to take the attendance
export class TakeAttendancePage {
    myDate= new Date().toISOString().slice(0, 10);
    error: any;
    loading: any;
    emp_count=0;
    Indate: String = new Date(new Date().getTime()).toLocaleTimeString().substr(0, 8)
    emp = {
        "EmpCode": '',
        "Punch_mode": 'check_in',
        "Punch_time": this.Indate,
        "Extra_hour_mode": 'Early',
        "Extra_hour": '0'
    };

    attendance_list: any = {
        "EmpName": '',
        "EmpCode": '',
        "Punch_mode": '',
        "Punch_time": this.Indate,
        "Extra_hour_mode": '',
        "Extra_hour": '',
        "Image": ''
    };

    // This is the list of object (attendance data) that is passes to the auth service
    public objLstAttendanceData: any = [];
    public List: any = [];
    //attendance: any = {};

    // variable to store the base64 image
    public base64Image: string;

    // details that are retrieved from the verify employee API
    public details: any = {};

    // temporary variable to store the above
    public det: any = {};

    // details that are passed to the auth. This is a list.
    public jsonArray: any = [];

    // designation of the supervisor
    designation_name: any;
    
    // location of the project
    location: any;
    
    // name of the project
    project: any;
    
    // name of the supervisor
    user_name: any;
    
    // employee id of the supervisor
    usercode: any;
    
    // location identifier for a particular location
    locationId: any;

    // project id for a particular project
    projectId: any;

    // sub: any = {};

    // parameter that determines whether face recognition is enabled or not
    EnableFaceRecognition: any;
    
    // parameter that tracks whether photo is taken or not
    user_snap_taken=false;

    // parameter that tracks whether the employee is verified or not
    employee_verified=false;

    distance:any;
                        
    // object to store the attendance information
    attendance: any = {
        "EmpName": '',
        "EmpCode": '',
        "Punch_mode": '',
        "Punch_time": this.Indate,
        "Extra_hour_mode": '',
        "Extra_hour": '',
        "Image": ''
    };
    
    // storage for image bytes and blob
    byteArray: any;
    blob: Blob;
    // network variable
    connected: Subscription;
    disconnected: Subscription;

    // related to the Microsoft Azure Face SDK
    public binaryImage: any;
    public faceIds: any;
    public faceData: any;
    public personId: any;
    public personData: any;
    public personDataStatus: any;


    constructor(private file: File,
        public http: Http,
        private auth: AuthService,
        public dialogs:Dialogs,
        public formbuilder: FormBuilder,
        public model: ModalController,
        private loadingCtrl: LoadingController,
        public navCtrl: NavController,
        private network: Network,        
        public alertCtrl:AlertController,
        public platform:Platform,
         public viewCtrl:ViewController,
        public navParams: NavParams, private toastCtrl: ToastController,
        public camera: Camera) {
            this.project = this.navParams.get('project');
            this.location = this.navParams.get('location')
            this.designation_name = this.navParams.get('designation_name');
            this.user_name = this.navParams.get('user_name');
            this.usercode = this.navParams.get('usercode');
            this.locationId = this.navParams.get('locationId');
            this.projectId = this.navParams.get('projectId');
            console.log(this.locationId, "take_attendance page");
            this.EnableFaceRecognition = this.navParams.get('EnableFaceRecognition');
            console.log(this.EnableFaceRecognition);
            this.distance = this.navParams.get('distance')
    }

    ionViewDidEnter() {
      let backAction =  this.platform.registerBackButtonAction(() => {
           
                console.log("take page cango back");
              if(this.objLstAttendanceData.length>=1){
                let alert = this.alertCtrl.create({
                    title: 'Alert',
                    message: 'Do you want to continue?',
                    buttons: [
                    {
                        text: 'Yes',
                        handler: () => {
                        this.objLstAttendanceData.length = 0;
                        this.navCtrl.pop();
                        console.log('ok clicked');
                        backAction();
                       
                        }
                    },
                    {
                        text: 'No',
                        role: 'cancel',
                        handler: () => {
                        console.log('Cancel clicked');
                        // backAction();
                        }
                    }
                    ]
                });
                alert.present();
              
            }
            else{
                this.navCtrl.pop();
                backAction();

            }
        },2);
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
    


                    
    // function for verifying the employee id using the HRMS system
    empIdVerification() {

        this.emp_id_changed();
        
        // TO_DO: Instead of checking length, Need to change logic to see if empcode is empty or not.
        if (this.emp.EmpCode.length < 1) {
              this.details.FirstName=" ";
            this.presentToast("Employee Id is required!");

        } else {
            this.details.FirstName=" ";
            this.employee_verified=false;
            this.loading = this.loadingCtrl.create({
                content:"Please wait.....",
            })
            this.loading.present();
            this.auth.empIdVerification(this.emp.EmpCode)
                .subscribe((data) => {
                    this.det = data;
                    if (this.det.ResultNo == 1) {
                        this.details = this.det;
                        console.log(this.details);
                        console.log(this.details.ResultNo);
                        this.employee_verified=true;
                        this.loading.dismiss();
                    } else {
                        this.loading.dismiss();
                        this.details.FirstName=" ";
                        this.employee_verified=false;
                        this.presentToast("Invalid Employee!!!");
                    }
                })
        }
    }

    increment_count(){
        this.emp_count = this.emp_count + 1;
    }



// Function to add more records. This is invoked by clicking the "Add More" button (new Date(new Date().getTime())).valueOf()
    addMore() {
      
        let startTime :any = new Date(new Date(this.myDate+"T08:00:00"))
        this.Indate = new Date(new Date().getTime()).toLocaleTimeString().substr(0, 8)
        let timeDiff :any = +startTime - +new Date(new Date().getTime());
        console.log("startTime =>", startTime);
        console.log("time diff =>",(this.msToTime(timeDiff)));
        this.emp.Punch_time = this.Indate;      
        console.log("punch time =>",this.Indate);  
        console.log("%% emp ", this.emp);
        if (this.validateProfileFields(timeDiff)) {    
                this.attendance_list = {
                "EmpName": '',
                "EmpCode": '',
                "Punch_mode": '',
                "Punch_time": '',
                "Extra_hour_mode": '',
                "Extra_hour": '',
                "Image": ''
            };
   
            console.log("%% emp ", this.emp);
            console.log("Before ", this.attendance_list);
            this.attendance_list.EmpCode = this.emp.EmpCode;
            this.attendance_list.Punch_mode = this.emp.Punch_mode;
            this.attendance_list.Punch_time = this.emp.Punch_time;
            this.attendance_list.Extra_hour_mode = this.emp.Extra_hour_mode;
            this.attendance_list.Extra_hour = this.emp.Extra_hour;

     

            console.log("After ", this.attendance_list);
            this.attendance_list.EmpName = this.details.FirstName;
            this.attendance_list.Image = this.base64Image;
            this.List.push(this.attendance_list);
            this.objLstAttendanceData.push(this.emp);
            
            // increment counter (cart icon)
            this.increment_count();
            console.log(this.attendance_list, "list");
            this.presentLoading();
            
            // clear the data
            this.emp = {
                "EmpCode": '',
                "Punch_mode": "check_in",
                "Punch_time": "",
                "Extra_hour_mode": 'Early',
                "Extra_hour": '0'
            };
            this.details.FirstName="";
            this.details.ResultNo="";
            this.user_snap_taken=false;
            this.employee_verified=false;
            this.personData.name="";

           
        }

    }

 //add this function
    msToTime(s) {

                var mins = s / 1000 / 60;
                return Math.floor(mins);
            
    }

    change_punch_mode(){
        if(this.emp.Punch_mode=="check_in"){
            this.emp.Extra_hour_mode="Early";
        }
       if(this.emp.Punch_mode=="check_out"){
            this.emp.Extra_hour_mode="Lunch";
        }
    }

    // Function to be invoked on press of Submit button. 
    // Pushes the control to the ConfirmSubmissionPage
    submit() {
        if (this.objLstAttendanceData.length>=1){
            console.log(this.List);
            this.jsonArray = {
                "SupervisorId": '',
                "IProjectID": '',
                "ILocationID": '',
                "objLstAttendanceData": []
            }
            this.jsonArray.SupervisorId = this.usercode;
            this.jsonArray.IProjectID = this.projectId;
            this.jsonArray.ILocationID = this.locationId;
            this.jsonArray.objLstAttendanceData = this.objLstAttendanceData;
            console.log(this.jsonArray, "<<<<<<");
            this.navCtrl.push(ConfirmSubmissionPage, {
                employeeDetails: this.List,
                jsonArray: this.jsonArray,
                distance:this.distance
            },{animate: true});
        }
        else{
            this.presentToast("No Records to Submit! Please add attendance records before submitting."); 
        }
    }

    cart() {
        console.log("cart");
        // this.submit();
       if (this.objLstAttendanceData.length>=1){
            console.log(this.List);
            this.jsonArray = {
                "SupervisorId": '',
                "IProjectID": '',
                "ILocationID": '',
                "objLstAttendanceData": []
            }
            this.jsonArray.SupervisorId = this.usercode;
            this.jsonArray.IProjectID = this.projectId;
            this.jsonArray.ILocationID = this.locationId;
            this.jsonArray.objLstAttendanceData = this.objLstAttendanceData;
            console.log(this.jsonArray, "<<<<<<");
            this.navCtrl.push(ConfirmSubmissionPage, {
                employeeDetails: this.List,
                jsonArray: this.jsonArray,
                distance:this.distance
            },{animate: true});
        }
        else{
            this.presentToast("No Records founds!!");
        }
    }
    

    presentLoading() {
        let loading = this.loadingCtrl.create({
            content: 'Please wait....'
        });

        loading.present();
        setTimeout(() => {
            loading.dismiss();
        }, 3000);

    }

    presentToast(msg) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: 3000,
            position: 'middle',
            cssClass: 'toast_class'
        });
        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });
        toast.present();
    }

    //copy this validateProfileFields function

    validateProfileFields(validDate) {
            if (this.EnableFaceRecognition == false) {
                if (this.emp == null) {
                    this.presentToast("Empty Field!");
                    return false;
                } else if (this.emp.EmpCode.length < 1) {
                    this.presentToast("Employee id is required!");
                    return false;
                } else if (this.employee_verified==false) {
                    this.presentToast("Employee is not verified. Please Verify!");
                    return false;
                }
                else if (this.emp.Punch_mode.length < 1) {
                    this.presentToast("Punch_mode is required!");
                    return false;
                } else if (this.emp.Extra_hour.length < 1) {
                    this.presentToast("Extra_hour is required!");
                    return false;
                } else if (this.emp.Extra_hour_mode.length < 1) {
                    this.presentToast("Description is required!");
                    return false;
                }
                else if(this.emp.Punch_mode=="check_in" && this.emp.Extra_hour =="0.5"){
                    if(this.msToTime(validDate) < 30){
                        this.presentToast("Extra_hour validation for Early failed!!!!");
                        return false;
                    }else {return true;}
                }else if(this.emp.Punch_mode=="check_in" && this.emp.Extra_hour=="1"){
                    if(this.msToTime(validDate) < 60){
                            this.presentToast("Extra_hour validation for Early failed!!!!");
                        return false;
                    }else {return true;}
                }else if(this.emp.Punch_mode=="check_in" && this.emp.Extra_hour=="1.5"){
                    if(this.msToTime(validDate) < 90){
                    this.presentToast("Extra_hour validation for Early failed!!!!");
                    return false;
                    }else {return true;}
                }else if(this.emp.Punch_mode=="check_in" && this.emp.Extra_hour=="2"){
                    if(this.msToTime(validDate) < 120){
                    this.presentToast("Extra_hour validation for Early failed!!!!");
                    return false;
                    }else {return true;}
                }
                else if (this.user_snap_taken==false){
                    this.presentToast("Take Snap is required!");
                    return false;
                }
                return true;
            } else if (this.EnableFaceRecognition == true) {
                if (this.employee_verified==false) {
                    this.presentToast("Employee is not verified. Please take Snap and Verify!");
                    return false;
                }
                else if (this.emp.Punch_mode.length < 1) {
                    this.presentToast("Punch_mode is required!");
                    return false;
                } else if (this.emp.Extra_hour.length < 1) {
                    this.presentToast("Extra_hour is required!");
                    return false;
                } else if (this.emp.Extra_hour_mode.length < 1) {
                    this.presentToast("Description is required!");
                    return false;
                }
                else if (this.user_snap_taken==false){
                    this.presentToast("Take Snap is required!");
                    return false;
                }
                else if(this.emp.Punch_mode=="check_in" && this.emp.Extra_hour =="0.5"){
                    if(this.msToTime(validDate) < 30){
                            this.presentToast("Extra_hour validation for Early failed!!!!");
                        return false;
                    }else {return true;}
                }else if(this.emp.Punch_mode=="check_in" && this.emp.Extra_hour=="1"){
                    if(this.msToTime(validDate) < 60){
                            this.presentToast("Extra_hour validation for Early failed!!!!");
                        return false;
                    }else {return true;}
                }else if(this.emp.Punch_mode=="check_in" && this.emp.Extra_hour=="1.5"){
                    if(this.msToTime(validDate) < 90){
                    this.presentToast("Extra_hour validation for Early failed!!!!");
                    return false;
                    }else {return true;}
                }else if(this.emp.Punch_mode=="check_in" && this.emp.Extra_hour=="2"){
                    if(this.msToTime(validDate) < 120){
                    this.presentToast("Extra_hour validation for Early failed!!!!");
                    return false;
                    }else {return true;}
                }
                return true;
            }
    }
   

    
    back(){
        if(this.objLstAttendanceData.length>=1){
            let alert = this.alertCtrl.create({
                title: 'Alert',
                message: 'Do you want to continue?',
                buttons: [
                {
                    text: 'Yes',
                    handler: () => {
                    this.navCtrl.pop();
                    console.log('ok clicked');
                   
                    }
                },
                {
                    text: 'No',
                    role: 'cancel',
                    handler: () => {
                    console.log('Cancel clicked');
                    }
                }
                ]
            });
            alert.present();
          
        }
        else{
            this.navCtrl.pop();
        }
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

    takeDummyPicture() {
        this.camera.getPicture({
            destinationType: this.camera.DestinationType.DATA_URL,
            sourceType: this.camera.PictureSourceType.CAMERA,
            encodingType: this.camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            saveToPhotoAlbum: true,
            correctOrientation: true
            
        }).then((imageData) => {
            console.log("Inside takeDummyPicture()")
            this.user_snap_taken=true;
            this.base64Image = "data:image/jpeg;base64," + imageData;

        });
    }

    emp_id_changed(){    
        this.user_snap_taken=false;
    }

    // Function to take snap
    takePicture() {
            
        if (this.EnableFaceRecognition == false){
            console.log("Taking Dummy picture");
            this.takeDummyPicture();
            
        }
        else{
        
            console.log("Taking picture and sending for actual verification");
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
                this.user_snap_taken=true;
                console.log("ImageDate: ", imageData)
                // detect face
                this.base64Image = "data:image/jpeg;base64," + imageData;
                this.binaryImage = this.b64toBlob(imageData, "image/png", "");
                console.log("BinaryImage: ", this.binaryImage)

                this.auth.detectFace(this.binaryImage).subscribe((data) => {
                    
                    if(data.length==0 || data.length==null){
                        this.loading.dismiss();
                        this.dialogs.alert("Face not recognized / detected. Please try again","Error","OK");
                        this.personDataStatus = "false";
                        this.personData.name=" ";
                        this.employee_verified=false;
                      
                     
                    }else{
                    console.log(data);
                    console.log(data[0].faceId);

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
                        console.log(data);
                        if(data[0].candidates.length == 0 || data[0].candidates.length == null){
                            // this.personDataStatus = "false";
                            this.loading.dismiss();
                            this.dialogs.alert("Valid Face not Detected. Please try again!","ERROR","OK");
                            this.personDataStatus = "false";
                            this.personData.name=" ";
                            this.employee_verified=false;
                           
                        }
                        else {
                         // get person data
                        this.personId = data[0].candidates[0].personId;
                        this.auth.getPersonDetails(this.personId).subscribe((data) => {
                            console.log(data);
                            this.personData = data;
                            this.personDataStatus = "true";
                            this.details.FirstName=this.personData.name;
                            this.emp.EmpCode=this.personData.userData.substring(6);
                            this.employee_verified=true;
                            this.loading.dismiss();
                            
                        }, (error) => {
                            console.log(error);
                            this.loading.dismiss();
                              this.dialogs.alert('Error occured while trying "Get person details". Please try later!!',"ERROR","OK");
                            this.personDataStatus = "false";
                            this.personData.name=" ";
                            this.employee_verified=false;
                          
                        });
                        }
                    }, (error) => {
                        this.loading.dismiss();
                        console.log(error);
                        this.dialogs.alert('Error occured while trying "Identify Face". Please try later!!',"ERROR","OK");
                    });
                    }
                }, (error) => {
                    console.log(error);
                    this.loading.dismiss();
                    this.dialogs.alert('Valid Face not Detected. Please try again!!',"ERROR","OK");
                });
            }, (err) => {
                this.loading.dismiss();
               console.log("error");
            });
        }
    }    

}