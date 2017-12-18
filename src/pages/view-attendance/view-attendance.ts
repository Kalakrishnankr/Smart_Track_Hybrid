import { Component } from '@angular/core';
import { ToastController, App,NavController, NavParams, ViewController,ModalController, Platform, LoadingController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service/auth-service';
import { ViewDetailPage } from '../view-detail/view-detail';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';


@Component({
  selector: 'page-view-attendance',
  templateUrl: 'view-attendance.html',
})

// Functionality to get the attendance details on click of "View Attendance"
export class ViewAttendancePage {
  supervisor_id : any ;
  myDate= new Date().toISOString().slice(0, 10);
  my_Date :any;
  employee_list:any = {} ;
  get_report_List :any = {};
  loading:any;
  AttendanceList :any =[];
  willEnterStart:any;
  public buttonClicked: boolean = false; 
  status:boolean ;
  connected: Subscription;
  disconnected: Subscription;
  constructor(private auth: AuthService,
              private network: Network,
              public platform:Platform,
              public view: ViewController,
              public navCtrl: NavController,
              public loadingCtrl:LoadingController, 
              public navParams: NavParams, 
              public modalCtrl:ModalController,
              public app: App,
              public toastCtrl:ToastController) {
     this.supervisor_id = this.navParams.get('supervisor_id');
      this.loading = this.loadingCtrl.create({
            content:"Please wait......",
        })
        this.loading.present();
        this.getData(this.myDate);
       
        
     console.log("view attendance page constructor");
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

  getData(my_Date){
    let backAction = this.platform.registerBackButtonAction(() => {
      console.log("android backbutton clicked...");
      if(this.navCtrl.canGoBack()){
        console.log("can go back=>>");
          this.loading.dismiss();
          this.navCtrl.pop();
          backAction();
    }});
    this.auth.getReport(this.supervisor_id,my_Date)
      .subscribe((data) =>{
        this.get_report_List = data;
        if(this.get_report_List.ResultNo==0){
          this.loading.dismiss();
           console.log("No Records fetched. =>>");
          this.presentToast("No Records fetched...")
        }
        this.AttendanceList = this.get_report_List.AttendanceList;
        console.log(" listed");
        this.loading.dismiss();
        }, (err) => {
          this.loading.dismiss();
          console.log("No Records fetched.");
          this.presentToast("Error//: Getting report");
        }
      );
  }
  
     


  // Fetch the result from the api
  get(my_Date){
    this.loading = this.loadingCtrl.create({
      content:"Please wait......",
  })
  this.loading.present();
   const overlayView = this.app._appRoot._overlayPortal._views[0];
   let backAction = this.platform.registerBackButtonAction(() => {
      console.log("android backbutton clicked...");
      if(this.navCtrl.canGoBack()){
        console.log("can go back=>>");
          overlayView.dismiss();        
          this.loading.dismiss();
          this.navCtrl.pop();
          backAction();
    }});
    this.auth.getReport(this.supervisor_id,my_Date)
      .subscribe((data) =>{
        this.get_report_List = data;
        if(this.get_report_List.ResultNo==0){
          this.loading.dismiss();
           console.log("No Records fetched. =>>");
          this.presentToast("No Records fetched...")
        }
        this.AttendanceList = this.get_report_List.AttendanceList;
        console.log(" listed");
        this.loading.dismiss();
        }, (err) => {
          this.loading.dismiss();
          console.log("No Records fetched.");
          this.presentToast("Error//: Getting report");
        }
      );
  }
  
  
  public card_details(SEmployeeNumber,loopPosition) {
      this.buttonClicked = !this.buttonClicked;
      let modal=this.modalCtrl.create( ViewDetailPage,{loopPosition:loopPosition,AttendanceList:this.AttendanceList,SEmployeeNumber:SEmployeeNumber});
      modal.present();
  }

  public card_click() {
    this.status = true;
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


