import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController, ToastController, AlertController } from 'ionic-angular';
import { AppBase } from '../../app/app.base';
import { StatusBar } from '@ionic-native/status-bar';
import { BookApi } from '../../providers/book.api';

/**
 * Generated class for the IndexPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-index',
  templateUrl: 'index.html',
  providers:[BookApi]
})
export class IndexPage extends AppBase {
  book={id:"",name:""};
  pianlist=[];
  lastread=null;
  commentlist=[];

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public alertCtrl: AlertController
    , public statusBar: StatusBar, public viewCtrl: ViewController, public toastCtrl: ToastController
    , public navParam: NavParams,public bookapi:BookApi) {

    super(navCtrl, modalCtrl, viewCtrl, statusBar, toastCtrl, alertCtrl, navParam);

  }

  m1="index";
  
  onMyShow(){
    this.bookapi.book({id:this.options.id}).then((book)=>{
      this.book=book;
    });
    this.bookapi.index({book_id:this.options.id}).then((pianlist)=>{
      this.pianlist=pianlist;
    });
    this.bookapi.readlist({book_id:this.options.id}).then((list)=>{
      if(list.length>0){
        this.lastread=list[0];
      }
    });

    this.bookapi.commentlist({  ju_id: -1,jie_id:-1,book_id:this.options.id }).then((commentlist) => {
      this.commentlist = commentlist;
    });
  }
  gotoContent(book_id,jie_id){
    if(jie_id<=0){
      return;
    }
    this.modal("BookPage",{book_id:book_id,jie_id:jie_id},()=>{
      this.onMyShow();
    });
  }

}

