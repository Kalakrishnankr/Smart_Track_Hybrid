import { Component } from '@angular/core';
import { NavController, Platform, NavParams,ViewController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';
import { File } from '@ionic-native/file';
import { AuthService } from '../../providers/auth-service/auth-service';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';
import { ViewAttendancePage } from '../view-attendance/view-attendance';

declare var cordova:any;
declare var window;
@Component({
  selector: 'page-email-attendance',
  templateUrl: 'email-attendance.html',
})
export class EmailAttendancePage {
  email_attendance: any;
  email_id: string;
  email_date= new Date().toISOString().slice(0, 10);
  base64_pdf:any;
  supervisor_id:any;
  report_List :any = {};
  attendance_list :any =[];
  html_data: string;
  today = new Date().toISOString().slice(0, 10);
  filename:any;
  folderpath:any;
  projectSelected:any;
  locationSelected:any;
  connected: Subscription;
  disconnected: Subscription;
  largest:any;
 
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,  
              public platform:Platform,
              private toastCtrl: ToastController,
              public viewCtrl:ViewController,
              private network: Network,
              private dialogs:Dialogs,
              private emailComposer: EmailComposer,
              private auth: AuthService,
              public file:File) {
                let conVal = this.viewCtrl.index;
                console.log("detail 1 view val",conVal);
        this.supervisor_id = navParams.get('supervisor_id');
        this.projectSelected = localStorage.getItem('projectSelected');
        this.locationSelected = localStorage.getItem('locationSelected');
        // this.fetch_attendance_data(this.email_date);
        this.SentMail(this.email_date);
        console.log("###$$$$$$$$$   FDGHH   &^***************");

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


  // entry point report fetched and pdf create
  SentMail(email_date){
    this.report_List="";
    console.log(this.report_List);
    this.attendance_list="";
    console.log(this.attendance_list);
    this.html_data = "";
    console.log(this.html_data);
    if(this.platform.is('android')){
        this.file.removeFile(cordova.file.externalRootDirectory,"AttendanceReport.pdf").then(()=>console.log("file removed/***/*/*/*/***/*//*/**/*")).catch((err)=>console.log("error removing file+++++++++++++++++++++++",err));
    }
    else if(this.platform.is('ios')){
        this.file.removeFile(cordova.file.documentsDirectory,"AttendanceReport.pdf").then(()=>console.log("file removed/***/*/*/*/***/*//*/**/*")).catch((err)=>console.log("error removing file+++++++++++++++++++++++"));
    }
    this.fetch_attendance_data(email_date).then((result)=>{
      if(result){
          this.create_pdf().then((result)=>{
            console.log("@@@@@@@@@@@@Pdf created sucessfully@@@@@@@@@@@@@@@");
          });
        }
        else{
          console.log("error fetch......");
        }
    },err => console.log("error+++>>>>",err))
 
    
  }
  
  // validating field
  validateField(){
    
    var emailReg = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if(this.email_id == null){
      this.presentToast("Email ID is required!!!");
      console.log("111");
      return false;
    }else if(!emailReg.test(this.email_id)){
      this.presentToast("Please enter a valid Email ID!");
      console.log("2222");
      return false;
    }
    else if(this.report_List.ResultNo != 1 ){
      this.presentToast("No Data found on this date");
      return false;
    }else{
      console.log("3333");
      return true;
    }
  }

// emailcomposing
  emailReportSend(){
    if(this.validateField()){
      console.log("****** @@@@@ RESULT",this.report_List.ResultNo);
      this.presentToast("Your Request to get the email reports will be processed soon."); 
          let email = {
            to: this.email_id,
            attachments: [
              'base64:report.pdf//' + this.base64_pdf,
            ],
            subject: 'Attendance Report for ' + this.email_date + " requested by Supervisor " + this.supervisor_id, 
            body: '<b>View attendance details.</b> <br> Project Name:  ' + this.projectSelected +  '</br> <br> Location Name: ' + this.locationSelected + '</br>',
            isHtml: true
          };
          console.log("email composed");
          this.emailComposer.open(email).then((success)=>{
                   

          },(err)=>{
              console.log("ERROR OCCURED WHILE COMPOSING MAIL");
          })    
          
      }
  }

    
    create_table(){
      return new Promise((resolve)=>{
      this.html_data="<!DOCTYPE html> \
      <html> \
      <head> \
      <style> \
      table, th, td { \
          border: 1px solid black; \
          border-collapse: collapse; \
      } \
      th, td {\
          padding: 5px;\
          text-align: left;\
      }\
      table#t01 {\
          width: 100%;    \
          background-color: #f1f1c1;\
      }\
      </style>\
      </head>\
      <body>\
      <table id='t01'>\
        <tr>\
          <th>Firstname</th>\
          <th>EmployeeCode</th> \
          <th>STimeIn</th>\
          <th>SOutTime</th>\
          <th>Extra_hours</th>\
        </tr>"

        for (var j = 0; j<this.attendance_list.length; j++) {
          console.log("   J-  ",j);
          if(this.attendance_list[j].objLstExtraHours.length == 0){
            console.log("Length case    ////");
            this.html_data = this.html_data + "<tr>\
            <td>" + this.attendance_list[j].SFirstName + "</td>\
            <td>" + this.attendance_list[j].SEmployeeNumber + "</td>\
            <td>" + this.attendance_list[j].STimeIn + "</td>\
            <td>" + this.attendance_list[j].SOutTime + "</td>\
            <td>" + 0 + "</td>\
            </tr>"
          }
          else{
            this.largest =0;
            for(var i = 0; i < this.attendance_list[j].objLstExtraHours.length; i++){
                    console.log(" I- ",i);
                    if(this.attendance_list[j].objLstExtraHours[i].DblExtraHours >this.largest){
                      this.largest = this.attendance_list[j].objLstExtraHours[i].DblExtraHours;
                    }
            }
          }
              console.log(" Largest ",this.largest);
              this.html_data = this.html_data + "<tr>\
              <td>" + this.attendance_list[j].SFirstName + "</td>\
              <td>" + this.attendance_list[j].SEmployeeNumber + "</td>\
              <td>" + this.attendance_list[j].STimeIn + "</td>\
              <td>" + this.attendance_list[j].SOutTime + "</td>\
              <td>" + this.largest + "</td>\
              </tr>"
            
        }
        this.html_data = this.html_data + "</table></body></html>"
        console.log("OOOOOOOOOOOOOOOOO")
        console.log(this.html_data);
        resolve(true)
      });


    }
   
    // Fetch the result from the api
    fetch_attendance_data(attendance_date){
      return new Promise((resolve)=>{
      console.log("this.supervisor_id = ", this.supervisor_id);
      console.log("attendance_date = ", attendance_date);
      this.auth.getReport(this.supervisor_id, attendance_date)
        .subscribe((data) =>{
          if(data.ResultNo == 1){
          this.report_List = data;
          this.attendance_list = this.report_List.AttendanceList;
          console.log(this.attendance_list,"%%%%%% <===== value");
          this.create_table().then((result)=>{
            console.log("Inside Get report")
            
          })
          resolve(true)
          console.log("outside promise2@@@@@@@@@@@")
          
          }else{
            console.log("N0 data ");
            this.presentToast("No data found on this date");
            resolve(false)
          }
          }, (err) => {
           console.log("Error getting Report!!!");
          }
        );
        
      });
    }

    create_pdf(){
      console.log("inside create_pdf2222222222");
      return new Promise((resolve)=>{
        cordova.plugins.pdf.htmlToPDF({
          data: this.html_data,
          documentSize: "A4",
          landscape: "portrait",
          type: "base64",
          fileName: "AttendanceReport.pdf"
        }, 
        (success) => { 
                      console.log('success:');
                      this.base64_pdf=success;
                      var contentType = "application/pdf";
                      this.filename= "AttendanceReport.pdf";
                      this.folderpath=cordova.file.externalRootDirectory;
                      // var folderpath = cordova.file.externalRootDirectory;
                      var folderpath_ios = cordova.file.documentsDirectory;
                      // var filename = "AttendanceReport.pdf";
                        if(this.platform.is('android')){
                            console.log("running on android platform...");
                            this.b64toBlob(this.folderpath,this.filename,this.base64_pdf,contentType,128);
                            console.log("this.b64toBlob 0");
                            resolve(true);
                        }
                        if(this.platform.is('ios')){
                            console.log("running on ios platform.....");
                            this.b64toBlob(folderpath_ios,this.filename,this.base64_pdf,contentType,128);
                            resolve(true);
                        }


                    },
        (error) => {console.log('error:');
                    resolve(false)});
      })
   
      
      
    }

    /**
     * Create a PDF file according to its database64 content only.
     * 
     * @param folderpath {String} The folder where the file will be created
     * @param filename {String} The name of the file that will be created
     * @param content {Base64 String} Important : The content can't contain the following string (data:application/pdf;base64). Only the base64 string is expected.
     */
    savebase64AsPDF(folderpath,filename,content,contentType,DataBlob){
      
        // Convert the base64 string in a Blob
        console.log("converting into pdf");        
        window.resolveLocalFileSystemURL(folderpath, function(dir) {
            console.log("Access to the directory granted succesfully");
            dir.getFile(filename, {create:true}, function(file) {
                console.log("File created succesfully.");
                file.createWriter(function(fileWriter) {
                    console.log("Writing content to file");
                    fileWriter.write(DataBlob);
                   
                }, function(){
                    this.dialogs.alert('Unable to save file in path '+ folderpath,"ERROR","OK");
                });
        });
        });
    }

    
    /**
     * Convert a base64 string in a Blob according to the data and contentType.
     * 
     * @param b64Data {String} Pure base64 string without contentType
     * @param contentType {String} the content type of the file i.e (application/pdf - text/plain)
     * @param sliceSize {Int} SliceSize to process the byteCharacters
     * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
     * @return Blob
     */
    b64toBlob(folderpath, filename,b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;
            console.log("b64 to blob --")
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
          var blob = new Blob(byteArrays, {type: contentType});
           
            this.savebase64AsPDF(folderpath, filename, this.base64_pdf, contentType,blob)
            console.log("this.savebase64AsPDF 0");
    }



  presentToast(msg) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: 2000,
            position: 'middle',
            cssClass: 'toast_class'
        });
        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });
        toast.present();
  }
}