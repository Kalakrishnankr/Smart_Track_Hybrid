import { Component } from '@angular/core';
import { NavController, NavParams,ViewController,ToastController } from 'ionic-angular';
import { AuthService } from '../../providers/auth-service/auth-service';
import { SummaryPage } from '../summary/summary';
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';
@Component({
  selector: 'page-confirm-submission',
  templateUrl: 'confirm-submission.html',
})
export class ConfirmSubmissionPage {
  employeeDetails:any={};
  detail:any={};
  Result:any = [];
  jsonArray : any = [];
  distance:any;
  connected: Subscription;
  disconnected: Subscription;
  constructor(private toastCtrl: ToastController,private network: Network,public viewCtrl:ViewController,public dialogs:Dialogs,private auth: AuthService,public navCtrl: NavController, public navParams: NavParams) {
    this.employeeDetails = this.navParams.get('employeeDetails');
    this.jsonArray = this.navParams.get('jsonArray');
    this.distance = this.navParams.get('distance');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConfirmSubmissionPage');
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

  cancel() {
    this.navCtrl.pop();
  }
  proceed() {
    console.log(this.jsonArray);
    this.auth.submit(this.jsonArray).subscribe((data) => {
        this.detail = data;
        this.Result = this.detail.Result
        console.log("******")
        console.log(this.Result)
        console.log("******")
        console.log(this.detail)
        
          this.navCtrl.push(SummaryPage ,{Result:this.Result},{animate: true, direction: 'forward'});
          }, (err) => {
            this.dialogs.alert("Failed to insert data");
          }
          
        );
  
     console.log(this.employeeDetails);
   
  }

}
