import { Component } from '@angular/core';
import { ViewController, NavController, NavParams ,ToastController} from 'ionic-angular';
import { AuthService } from '../../providers/auth-service/auth-service';
import { HomePage } from '../home/home';
import { Network } from '@ionic-native/network';
import { Subscription} from 'rxjs/Subscription';
@Component({
  selector: 'page-summary',
  templateUrl: 'summary.html',
})
export class SummaryPage {
  employeeDetails:any = {};
  detail : any ={};
  Result : any = [];
  connected: Subscription;
  disconnected: Subscription;
  constructor(private toastCtrl: ToastController,private network: Network,public viewCtrl:ViewController,public auth: AuthService,public navCtrl: NavController, public navParams: NavParams) { 
     this.Result = this.navParams.get('Result');
     console.log(this.Result[0].SResult);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SummaryPage');
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
  submit() {
    this.navCtrl.push(HomePage).then(()=>{
      const index=this.viewCtrl.index;
      this.navCtrl.remove(0,index+1);
      console.log(index,"=>>index");
      
    })
  }

}
