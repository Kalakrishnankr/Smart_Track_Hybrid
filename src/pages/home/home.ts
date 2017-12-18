import { Component } from '@angular/core';
import { ViewController,NavController, App,AlertController,NavParams ,Platform} from 'ionic-angular';
import { ViewAttendancePage } from '../view-attendance/view-attendance';
import { GiveSelectDetailPage } from '../give-select-detail/give-select-detail';
import { Login } from '../login/login';
import { ToastController, LoadingController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation'; 
import { EmailAttendancePage} from '../email-attendance/email-attendance';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

// Home page which displays the menu items like take attendance, view attendance etc.
export class HomePage {
  // variables for idle condition
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;  

  userData:any;
  designation_name:any;
  user_name:any;
  usercode:any;
  projectAndLocation_list:any;
  EnableFaceRecognition:any;
  my_lat:number;
  my_long:number;
  proj_lat:number;
  proj_long:number;
  distance:string;
  connected: Subscription;
  disconnected: Subscription;


  constructor(public navParams:NavParams,
              private network: Network,
              public platform:Platform,
              public alertCtrl:AlertController,
              public navCtrl: NavController, 
              private idle: Idle, 
              public viewCtrl:ViewController,
              private keepalive: Keepalive,
              private toastCtrl: ToastController,
              private geolocation: Geolocation,
              public dialogs:Dialogs,
              private loadingCtrl: LoadingController,
              public app: App) 
              {
                
                this.userData                   = JSON.parse(localStorage.getItem('userData'));
                this.usercode                   = localStorage.getItem('userCode');
                this.designation_name           = this.userData.Designation;
                this.user_name                  = this.userData.FirstName;
                this.projectAndLocation_list    = this.userData.ProjectDetails;
                this.EnableFaceRecognition      = this.userData.EnableFaceRecognition;
                 // sets an idle timeout of 5 seconds, for testing purposes.
                idle.setIdle(590);
                // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.this.idleState = 'You will time out in ' + countdown + ' seconds!'
                idle.setTimeout(10);
                // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document...console.log("you will time out in"+ countdown), 
                idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
                  console.log("checking idle");
                idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
                  console.log("No longer idle.");
                idle.onTimeout.subscribe(() => {
                  this.idleState = 'Timed out!';
                    console.log("Timed out!");
                  this.timedOut = true;
                  //localStorage.clear();
                  this.navCtrl.setRoot(Login);
                });
                idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
                  console.log("You\'ve gone idle!");
                idle.onTimeoutWarning.subscribe((countdown) => console.log("you will time out in"+ countdown));
              

                // sets the ping interval to 15 seconds
                keepalive.interval(15);

                keepalive.onPing.subscribe(() => this.lastPing = new Date());

                this.reset();

                // For debug
                console.log(this.EnableFaceRecognition);
                console.log(this.projectAndLocation_list,"home project list");
                
              }

  reset() {
      console.log("inside reset function");
      this.idle.watch();
      this.idleState = 'Started.';
      this.timedOut = false;
  }

  ionViewWillEnter() {
      console.log("this function will be called every time you enter the view");
      this.get_project_location_geo();
      this.get_geo();
               
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
    console.log("home page will leave ");
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


  // Logout function which will clear the local storage and delete the stored information
  logout(){
    let confirm = this.alertCtrl.create({
      message: 'Do You Want To Logout?',
      buttons: [{
        role: 'cancel',
        text: 'Cancel',
        handler: () => {}
      },{
        text: 'Yes',
        handler: () => {
          localStorage.clear();
          this.navCtrl.setRoot(Login);
        }
      }]
    });
    confirm.present();
    console.log('logged out');    
  }

  // Function that invokes the begining of the Take Attendance feature. 
  take_attendance(){    
    
    console.log(this.user_name);
    console.log("Facrecognition: ", this.EnableFaceRecognition)

    // Push to the GiveSelectDetailPage which displays the location and project selection options
    this.navCtrl.push(GiveSelectDetailPage, {
                      EnableFaceRecognition:this.EnableFaceRecognition,
                      projectAndLocation_list:this.projectAndLocation_list,
                      user_name:this.user_name,
                      designation_name:this.designation_name,
                      usercode:this.usercode,
                      my_lat:this.my_lat,
                      my_long:this.my_long,
                      proj_lat:this.proj_lat,
                      proj_long:this.proj_long,
                      distance:this.distance
                      }, {animate: true});
  }

  // Function that pushes the control to the view attendance page
  view_attendance(){
    // this.presentLoading();
    this.navCtrl.push(ViewAttendancePage, {supervisor_id:this.usercode});
  }
  email_reports(){
    this.navCtrl.push(EmailAttendancePage, {supervisor_id:this.usercode});
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

    get_geo()
    {
        console.log("Inside getting get_geo");
        this.geolocation.getCurrentPosition().then((resp) => {
            this.my_lat = Number(resp.coords.latitude.toFixed(4));
            this.my_long = Number(resp.coords.longitude.toFixed(4));
            console.log("Getting geo");
            console.log('My latitude : ', this.my_lat);
            console.log('My longitude: ', this.my_long)
            console.log(this.my_lat);
            console.log(this.my_long);
            console.log(this.proj_lat);
            console.log(this.proj_long);
            this.distance = this.calculate_distance(this.my_lat, this.proj_lat, this.my_long, this.proj_long);
      
          }).catch((error) => {
          this.dialogs.alert('Error getting location'+JSON.stringify(error),"Error","OK");
        });

    }


    get_project_location_geo(){
      console.log("Inside getting get_project_location_geo");
      this.proj_lat=1.43443;
      this.proj_long=103.8026;
                
    }

    calculate_distance(lat1:number,lat2:number,long1:number,long2:number){
      console.log("Inside getting calculate_distance");
      console.log(lat1);
      console.log(lat2);
      console.log(long1);
      console.log(long2);
      let p = 0.017453292519943295;    // Math.PI / 180
      let c = Math.cos;
      let a = 0.5 - c((lat1-lat2) * p) / 2 + c(lat2 * p) *c((lat1) * p) * (1 - c(((long1- long2) * p))) / 2;
      let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
      return dis.toFixed(2);
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

}