import { Component } from '@angular/core';
import { NavController, NavParams,ViewController,ToastController,Platform } from 'ionic-angular';
import { TakeAttendancePage } from '../take-attendance/take-attendance';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';
@Component({
  selector: 'page-give-select-detail',
  templateUrl: 'give-select-detail.html',
})

// Functionality to display the drop down that contains Project and Location information
// Project and Information is retrieved (projectAndLocation_list) when we call the Login API. It is retrieved as an array object. 
// One Project can have multiple locations as well.

export class GiveSelectDetailPage {
  public project:any;
  public location:any;
  designation_name:any;
  usercode:any;
  user_name:any;
  projectAndLocation_list:any;
  location_list:any;
  projectId:any;
  locationId:any;
  EnableFaceRecognition:any;
  distance:any;
  my_lat:any;
  my_long:any;
  public unregister: any;
  
  proj_lat:any;
  proj_long:any;
  connected: Subscription;
  disconnected: Subscription;
  constructor ( private toastCtrl: ToastController,
                private network: Network,
                public viewCtrl:ViewController,
                public navCtrl: NavController, 
                public platform:Platform,
                public dialogs:Dialogs,
                public navParams: NavParams) {
                    this.designation_name = this.navParams.get('designation_name');
                    this.user_name = this.navParams.get('user_name');
                    this.usercode = this.navParams.get('usercode');        
                    this.EnableFaceRecognition =this.navParams.get('EnableFaceRecognition');
                    this.distance = this.navParams.get('distance'),
                    this.my_lat = this.navParams.get('my_lat');
                    this.my_long =  this.navParams.get('my_long');
                    this.proj_lat =  this.navParams.get('proj_lat');
                    this.proj_long =  this.navParams.get('proj_long');
                   
                    console.log(this.EnableFaceRecognition);     
                    console.log('In GiveSelectDetailPage');

                }

  ionViewDidEnter() {
    
    // get projects and location list from nav params 
    this.projectAndLocation_list = this.navParams.get('projectAndLocation_list');
    this.connected = this.network.onConnect().subscribe(data => {
      console.log(data)
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));
   
    this.disconnected = this.network.onDisconnect().subscribe(data => {
      console.log(data)
      this.displayNetworkUpdate(data.type);
    }, error => console.error(error));
    // check is there any projectselected
    if(localStorage.getItem('projectSelected')) {
      this.project = localStorage.getItem('projectSelected');

      for (var projectIndex = 0; projectIndex < this.projectAndLocation_list.length; projectIndex++) {
        if(this.project == this.projectAndLocation_list[projectIndex].SProjectTitle) {
          this.location_list = this.projectAndLocation_list[projectIndex].Location;

          if(this.projectAndLocation_list[projectIndex].Location[0]){
            this.location = this.projectAndLocation_list[projectIndex].Location[0].SLocation;
          }
          projectIndex = this.projectAndLocation_list.length;
        }
      }
    } 

    else {
      if(this.projectAndLocation_list[0]) {
        this.location_list = this.projectAndLocation_list[0].Location;
        this.project       = this.projectAndLocation_list[0].SProjectTitle;
        if(this.projectAndLocation_list[0].Location[0]){
          this.location = this.projectAndLocation_list[0].Location[0].SLocation;
        }
      }
    }

    console.log(this.projectAndLocation_list);
    console.log(this.location_list);
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



  ionViewDidLoad() {
    console.log('In GiveSelectDetailPage');
    this.projectAndLocation_list = this.navParams.get('projectAndLocation_list');
    // check is there any projectselected
    if(localStorage.getItem('projectSelected')) {
      this.project = localStorage.getItem('projectSelected');

      for (var projectIndex = 0; projectIndex < this.projectAndLocation_list.length; projectIndex++) {
        if(this.project == this.projectAndLocation_list[projectIndex].SProjectTitle) {
          this.location_list = this.projectAndLocation_list[projectIndex].Location;

          if(this.projectAndLocation_list[projectIndex].Location[0]){
            this.location = this.projectAndLocation_list[projectIndex].Location[0].SLocation;
          }
          projectIndex = this.projectAndLocation_list.length;
        }
      }
    } 
    
    else {
      if(this.projectAndLocation_list[0]) {
        this.location_list = this.projectAndLocation_list[0].Location;
        this.project       = this.projectAndLocation_list[0].SProjectTitle;
        if(this.projectAndLocation_list[0].Location[0]){
          this.location = this.projectAndLocation_list[0].Location[0].SLocation;
        }
      }
    }
    console.log(this.projectAndLocation_list);
    console.log(this.location_list);
  }

  // Function that gets invoked when the drop down value is changed
  onSelect() {
    console.log(this.project);
    for (var i= 0; i < this.projectAndLocation_list.length; i++) {
      if(this.project == this.projectAndLocation_list[i].SProjectTitle) {
        this.location_list = this.projectAndLocation_list[i].Location;
        this.location   = this.projectAndLocation_list[i].Location[0].SLocation;
        console.log(this.location_list);
        i = this.projectAndLocation_list.length;
      }
    }
  }

  // function to go to next page, after selecting project and location
  next() {
    if (this.validateFields()) {
      let len = this.projectAndLocation_list.length;
      for(let i=0;i<len;i++) {
        if(this.project == this.projectAndLocation_list[i].SProjectTitle) {
          this.projectId = this.projectAndLocation_list[i].IProjectID;
          let len1 = this.projectAndLocation_list[i].Location.length;
          for(let j=0;j<len1;j++){
            if(this.location = this.projectAndLocation_list[i].Location[j].SLocation) {
              this.locationId = this.projectAndLocation_list[i].Location[j].ILocationId;
            }
          }
        }
      }

      console.log("button clicked",this.locationId);
      localStorage.setItem('projectSelected', this.project);
      localStorage.setItem('locationSelected', this.location);

      this.navCtrl.push(TakeAttendancePage,{ EnableFaceRecognition:this.EnableFaceRecognition,
                                             locationId:this.locationId,
                                             projectId:this.projectId,
                                             project:this.project,
                                             location:this.location,
                                             user_name:this.user_name,
                                             designation_name:this.designation_name,
                                             distance:this.distance,
                                             usercode:this.usercode});
    }
    
    // TO_DO: Need to check if this is necessary -- Robin
    this.location = null;
    this.project = null;
  }
  
  // function for toast
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'middle'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();  
  }

  // function to validate whether project and location are populated or not
  validateFields() {
    if (this.project== null) {
      this.presentToast("Please select a project!");
      return false;
    } else if (this.location== null) {
      this.presentToast("Please select a location!");
      return false;
    } 
    return true;
  }

}
