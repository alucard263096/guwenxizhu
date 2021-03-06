import { ApiConfig } from "./api.config";
import { AppUtil } from "./app.util";
import { AppLang } from "./app.lang";
import { StatusBar } from '@ionic-native/status-bar';
import { NavController, ModalController, ViewController, ToastController, NavParams, AlertController }
    from "ionic-angular";
import { InstApi } from "../providers/inst.api";
import { MemberApi } from "../providers/member.api";
import { MyApp } from "./app.component";
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { ReturnStatement } from "@angular/compiler";
import { TabsPage } from "../pages/tabs/tabs";


export class AppBase {
    public needlogin = true;

    public static myapp: MyApp = null;
    public static instapi: InstApi = null;
    public static memberapi: MemberApi = null;
    public static UNICODE = "test";
    public static Tabs:TabsPage=null;

    public statusBar: StatusBar = null;
    public navCtrl: NavController = null;
    public modalCtrl: ModalController = null;
    public viewCtrl: ViewController = null;
    public toastCtrl: ToastController = null;
    public alertCtrl: AlertController = null;
    public navParams: NavParams = null;
    public statusBarStyle = "X";//{DARK}
    public uploadpath: string = ApiConfig.getUploadPath();
    public util = AppUtil;
    public Lang = [];
    public res = [];
    public InstInfo = { logo: "", memberlogo: "" };
    public MemberInfo = { id: "", name: "", photo: "", introduce: "" };

    public options = null;

    public firseonshow = true;


    public constructor(navCtrl: NavController,
        modalCtrl: ModalController,
        viewCtrl: ViewController,
        statusBar: StatusBar,
        toastCtrl: ToastController,
        alertCtrl: AlertController,
        navParams: NavParams) {

        this.navCtrl = navCtrl;
        this.modalCtrl = modalCtrl;
        this.viewCtrl = viewCtrl;
        this.statusBar = statusBar;
        this.toastCtrl = toastCtrl;
        this.alertCtrl = alertCtrl;
        this.navParams = navParams;

        if (navParams != null) {
            console.log(navParams.data);
        }
    }
    setStatusBar() {
        //  this.statusBar.styleLightContent();
    }
    ionViewDidLoad() {
        ApiConfig.SetUnicode(AppBase.UNICODE);
        this.getResources();
        this.getInstInfo();
        this.onMyLoad();
        this.options = this.navParams.data;
    }
    onMyLoad() {
    }
    getInstInfo() {
        AppBase.instapi.info({}, false).then((instinfo) => {
            this.InstInfo = instinfo;
            console.log(instinfo);
        });
    }
    getMemberInfo() {
        AppBase.memberapi.info({}).then((memberinfo) => {
            if (memberinfo == null || memberinfo.mobile == undefined || memberinfo.mobile == "") {
                //alert("?");
                memberinfo = null;
            }
            this.MemberInfo = memberinfo;

        });
    }
    getResources() {
        AppBase.instapi.resources({}, false).then((res) => {
            this.res = res;
        });
    }
    ionViewDidEnter() {
        this.setStatusBar();
        this.Lang = AppLang.getLang();
        if(AppBase.Tabs!=null){
            AppBase.Tabs.Lang=this.Lang;
        }

        var token = window.localStorage.getItem("token");
        //alert(token);
        if (token == null) {
            if (this.needlogin == true) {
                this.modal("LoginPage", {});
            } else {

                this.onMyShow();
            }
        } else {
            ApiConfig.SetToken(token);
            AppBase.memberapi.info({}).then((memberinfo) => {
                if (memberinfo == null || memberinfo.mobile == undefined || memberinfo.mobile == "") {

                    memberinfo = null;
                    if (this.needlogin == true) {
                        this.modal("LoginPage", {});
                        return;
                    }
                }
                this.MemberInfo = memberinfo;
                this.onMyShow();
            });
        }
        this.firseonshow = false;
    }
    onMyShow() {

    }
    onPullRefresh(ref) {
        this.onMyShow();
        ref.complete();
    }
    doRefresh(ref) {
        this.onPullRefresh(ref);
        // setTimeout(() => {
        //     ref.complete();
        // }, 1000);
    }
    onLoadMoreRefresh(ref) {
        ref.complete();
    }
    doInfinite(infiniteScroll) {
        this.onLoadMoreRefresh(infiniteScroll);
        // setTimeout(() => {
        //   infiniteScroll.complete();
        // }, 1000);
    }
    back() {
        this.navCtrl.pop();
    }
    close() {
        this.viewCtrl.dismiss({});
    }
    return(data) {
        this.viewCtrl.dismiss(data);
    }
    nagivate(pagename, param) {
        this.navCtrl.push(pagename, param);
    }
    modal(pageobj, param, callback = null) {
        var modal = this.modalCtrl.create(pageobj, param);
        modal.onDidDismiss((data, role) => {
            this.ionViewDidEnter();
            if (callback != null) {
                ///alert(data);
                callback(data);
            }
        });
        modal.present();
    }

    content(title, key) {
        this.modal("ContentPage", { title, key });
    }

    decode(val) {
        return AppUtil.HtmlDecode(val);
    }
    contentToLine(str) {
        if (str == null) {
            return "";
        }
        return str.split("\n");
    }

    tel(tel) {
        window.location.href = "tel:" + tel;
    }
    toast(msg) {
        if (msg == "") {
            return;
        }
        console.log(((msg.length / 3) + 1) * 1000);
        const toast = this.toastCtrl.create({
            message: msg,
            duration: ((msg.length / 3) + 1) * 1000
        });
        toast.present();
    }
    alert(msg) {

        const alert = this.alertCtrl.create({
            title: this.Lang["tips"],
            subTitle: msg,
            buttons: [this.Lang['iknow']]
        });
        alert.present();
    }
    confirm(msg, confirmcallback) {

        const alert = this.alertCtrl.create({
            title: this.Lang["tips"],
            subTitle: msg,
            buttons: [{
                text: this.Lang["cancel"],
                handler: () => {
                    console.log('Disagree clicked');

                    confirmcallback(false);
                }
            }, {
                text: this.Lang["ok"],
                handler: () => {
                    confirmcallback(true);
                }
            }]
        });
        alert.present();
    }
    checkLogin(callback) {
        if (this.MemberInfo == null) {
            var modal = this.modalCtrl.create("LoginPage");
            modal.onDidDismiss((islogin) => {
                if (islogin == "Y") {
                    callback();
                }
            });
            modal.present();
        } else {
            callback();
        }
    }
    hasLogin() {
        return this.MemberInfo != null;
    }
    store(name, key = null) {
        if (key == null) {
            return window.localStorage.getItem(name);
        } else {
            window.localStorage.setItem(name, key);
            return "";
        }
    }

    gotoBook(id) {
        this.modal("IndexPage", { id: id });
    }
    uploadFile(transfer: FileTransfer, filepath: string, module: string) {
        let options: FileUploadOptions = {
            fileKey: 'img'
        }


        var fileTransfer: FileTransferObject = transfer.create();
        return fileTransfer.upload(filepath, ApiConfig.getFileUploadAPI() + "?field=img&module=" + module, options)
            .then((data) => {
                // success
                //alert(data);
                return data.response.toString().split("|~~|")[1];
            }, (err) => {
                alert("upload faile");
                // error
            })
    }
    getMemberPhoto(photo: string) {
        if (photo == null || photo == undefined || photo.trim() == "") {
            return this.uploadpath + "inst/" + this.InstInfo.logo;
        } else {
            return this.uploadpath + "member/" + photo;
        }
    }
    sendComment(book_id, jie_id, ju_id, content) {
        this.modal("CommentPage", { book_id, jie_id, ju_id, content });
    }

    gotoContent(book_id, jie_id) {
        if (jie_id <= 0) {
            return;
        }
        this.modal("BookPage", { book_id: book_id, jie_id: jie_id }, () => {
            this.onMyShow();
        });
    }
}