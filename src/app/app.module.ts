import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { Login} from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { TakeAttendancePage } from '../pages/take-attendance/take-attendance';
import { ViewAttendancePage } from '../pages/view-attendance/view-attendance';
import { EmailAttendancePage } from '../pages/email-attendance/email-attendance';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthService } from '../providers/auth-service/auth-service';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import {Camera} from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import {GiveSelectDetailPage} from '../pages/give-select-detail/give-select-detail';
import {ConfirmSubmissionPage} from '../pages/confirm-submission/confirm-submission';
import { SummaryPage } from '../pages/summary/summary';
import { ViewDetailPage } from '../pages/view-detail/view-detail';
import { Geolocation } from '@ionic-native/geolocation';
import { EmailComposer} from '@ionic-native/email-composer';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { MomentModule } from 'angular2-moment'; // optional, provides moment-style pipes for date formatting
import { Dialogs } from '@ionic-native/dialogs';
import { Network } from '@ionic-native/network';
@NgModule({
  declarations: [
    MyApp,
    Login,
    HomePage,
    TakeAttendancePage,
    ViewAttendancePage,
    GiveSelectDetailPage,
    ConfirmSubmissionPage,
    EmailAttendancePage,
    SummaryPage,
    ViewDetailPage
    
    

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    MomentModule,
    NgIdleKeepaliveModule.forRoot(),
    IonicModule.forRoot(MyApp)
  ],

  
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Login,
    HomePage,
    TakeAttendancePage,
    ViewAttendancePage,
    GiveSelectDetailPage,
    ConfirmSubmissionPage,
    SummaryPage,
    EmailAttendancePage,
    ViewDetailPage
  ],
  providers: [
    StatusBar,
    Geolocation,
    SplashScreen,
    Dialogs,
    Network,
    EmailComposer,
    File,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthService
  ]
})
export class AppModule {}
