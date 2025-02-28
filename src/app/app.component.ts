import { Component } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AppData } from './models/appData';
import { DataKey } from './models/dataKey';
import { Session } from './models/session';
import { Todo } from './models/todo';
import { AuthenticationService } from './services/authentication.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'trackaday';
  authUID: String;
  appData: AppData;
  isReading: boolean;
  todoList: Todo[] = [];
  sessionList: Session[] = [];

  constructor(public authenticationService: AuthenticationService, public afs: AngularFirestore, private db: AngularFireDatabase){
    this.isReading = false;
    this.appData = new AppData();
    this.readAppData(DataKey.ALL_KEY);
    this.authUID ="";
  }

  ngOnInit() {}

  saveSessionData(sessionData: Session[]) {
    this.authUID = this.authenticationService.userID;
    this.appData.session = sessionData;
    const ref = this.db.list('Users/'+this.authUID+'/sessions')
    ref.remove();
    ref.push(sessionData).then((resp)=>{
      console.log("#####################", resp);
    }).catch((error)=>{
      console.error(error);
    })
  }

  saveTodoData(todoData: Todo[]) {
    this.authUID = this.authenticationService.userID;
    this.appData.tasks = todoData;
    const ref = this.db.list('Users/'+this.authUID+'/todos');
    ref.remove();
    ref.push(todoData).then((resp)=>{
      console.log("#####################", resp);
    }).catch((error)=>{
      console.error(error);
    })
  }

  showCpNotification(timeStr:string, quoteStr:string) {
  }

  readAppData(key: DataKey) {
    this.isReading = true;
    return new Promise(resolve=> {
      if(key == DataKey.SESSION_KEY){
        this.getSessionList();
        this.readCallback(key, this.sessionList);
      } else if (key == DataKey.TODO_KEY){
        this.getTodoList();
        this.readCallback(key, this.todoList);
      } else if (key == DataKey.ALL_KEY){
        this.getTodoList().then( num =>
            {
              this.getSessionList().then(num1=>{
                var allData = new AppData();
                allData.tasks = this.todoList;
                allData.session = this.sessionList;
                resolve(allData);
                this.readCallback(key, allData);
              })
        });
      }

    })
  }

  async getTodoList(){
    try{
      const promise = new Promise(resolve => {
        var authUID=JSON.parse(localStorage.getItem('user')!).uid;
        const todoRef = this.db.list('Users/'+authUID+'/todos');
          todoRef.valueChanges().subscribe((data)=>{
            if(data.length!=0){
              this.todoList = data[0] as Todo[];
            }
            else{
              this.todoList= [];
            }
            resolve(data);
          })
      });
      await promise;
    }
    catch(error){
      console.log('')
    }
  }

  async getSessionList(){
    try{
      const promise = new Promise(resolve => {
        var authUID=JSON.parse(localStorage.getItem('user')!).uid;
        const sessionRef = this.db.list('Users/'+authUID+'/sessions');
        sessionRef.valueChanges().subscribe((data)=>{
          if(data.length!=0){
            this.sessionList = data[0] as Session[];
          }
          else{
            this.sessionList=[];
          }
          resolve(data);
        });
      });
      await promise;
    }
    catch(error){
      console.log('');
    }
  }

  readCallback(key: DataKey, data: any){
    if(key == DataKey.SESSION_KEY){
      this.appData.session = data;
    } else if (key == DataKey.TODO_KEY){
      this.appData.tasks = data;
    } else if (key == DataKey.ALL_KEY){
      this.appData = data;
    }

    this.isReading = false;
  }
}
