import { Component } from '@angular/core';
import { NavController, NavParams,ViewController,Platform } from 'ionic-angular';


@Component({
  selector: 'page-view-detail',
  templateUrl: 'view-detail.html',
})
export class ViewDetailPage {
  AttendanceList:any=[];
  SEmployeeNumber:any;
  loopPosition: number;
  loading:any;
  
  constructor(public platform:Platform,public navCtrl: NavController, public navParams: NavParams,public viewCtrl:ViewController
) {
    this.AttendanceList = this.navParams.get('AttendanceList');
    this.SEmployeeNumber = this.navParams.get('SEmployeeNumber');
    this.loopPosition = this.navParams.get('loopPosition');
  }
  ionViewDidEnter() {
    let backAction =  this.platform.registerBackButtonAction(() => {
      console.log("second");
      this.viewCtrl.dismiss();
      backAction();
    },2)

 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ViewDetailPage');
  }
  closeModel(){
    this.viewCtrl.dismiss();
  }
  
}
