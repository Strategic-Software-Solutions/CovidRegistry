import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { UsernameValidator } from '../validators/UserNameVal';
import { ConfirmedValidator } from '../validators/ConfirmPassVal';
import { DataService } from '../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl,  } from '@angular/platform-browser';
import { SecurityContext } from "@angular/core";
@Component({
  selector: 'app-registry',
  templateUrl: 'registry.page.html',
  styleUrls: ['registry.page.scss']
})
export class RegistryPage  implements OnInit {
  constructor(public formBuilder: FormBuilder, private ds: DataService, 
    private route: ActivatedRoute, private sanitizer: DomSanitizer) {}
  async ngOnInit() {
    this.route.queryParams
    .subscribe(params => {
      if(params.logo)
        this.logo = this.sanitizer.sanitize(SecurityContext.URL, this.sanitizer.bypassSecurityTrustResourceUrl(params.logo));
      if(params.channel)
        this.channelId = params.channel;
      if(params.name) 
        this.orgName = params.name;      
    });

    await this.ds.init();
    setTimeout(() => {
      this.loading = false;
    },500)
    console.log(`channel: ${this.channelId}`);
  }
  orgName: string = 'BioLinked';
  loading: boolean = false;
  channelId: string = "covidRegApp"
  testDate: string;
  symptomDate: string;
  logo: string;
  userId: number; 
  questions: any = [];
  questionIndex: number = 0;
  userNameAvailable: any = true;
  emailAvailableToReg: any = true;
  regError: boolean = false;
  regErrorMsg: string = '';
  complete: boolean = false;
  regForm = this.formBuilder.group({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    zip: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$'),
    ])),
    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ])),
    phone: new FormControl('', Validators.compose([
      Validators.required,
    ])),
    username: new FormControl('', Validators.compose([
      UsernameValidator.validUsername,
      Validators.maxLength(25),
      Validators.minLength(5),
      Validators.pattern('^[a-zA-Z0-9_-]{5,16}$'),
      Validators.required
    ])),
    password: new FormControl('', Validators.compose([
      Validators.minLength(8),
      Validators.required,
      Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$') 
      
    ])),
    confirmPass: new FormControl('', Validators.required)
  },
  {
    validator: ConfirmedValidator('password', 'confirmPass')
  })
  validation_messages = {
    'username': [
      { type: 'required', message: 'Username is required.' },
      { type: 'minlength', message: 'Username must be at least 5 characters long.' },
      { type: 'maxlength', message: 'Username cannot be more than 25 characters long.' },
      { type: 'pattern', message: 'Your username must contain only numbers and letters.' }
    ],
    'firstName': [
      { type: 'required', message: 'First name is required.' }
    ],
    'lastName': [
      { type: 'required', message: 'Last name is required.' }
    ],
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter valid email.' },
    ],
    'birthday': [
      { type: 'required', message: 'Birthday is required.' }
    ],
    'address': [
      { type: 'required', message: 'Address is required.' }
    ],
    'zip': [
      { type: 'required', message: 'Zip code is required.' },
      { type: 'pattern', message: 'Please enter valid zip.' },

    ],
    'phone': [
      { type: 'required', message: 'Phone number is required.' },
      { type: 'minlength', message: 'Phone number must be 10 digits' },
      { type: 'maxlength', message: 'Phone number must be 10 digits' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 8 characters long.' },
      { type: 'maxlength', message: 'Password cannot be more than 25 characters long.' },
      { type: 'pattern', message: 'Password much contain at least uppercase, lowercase, special, and numeric character.' },
    ]
  }
  confirmPass: string = undefined;
  regModel: any = this.cleanModel();
  cleanModel() {
      return {
      FirstName: undefined,
      LastName: undefined,
      Birthday: undefined,
      Email: undefined,
      HomePhone: undefined,
      CellPhone: undefined,
      Address1: undefined,
      Address2: undefined,
      Zip: undefined,
      UserName: undefined,
      Password: undefined,
      Channel: undefined
    }
  }
  async register() {
    this.regModel.FirstName = this.regForm.get('firstName').value;
    this.regModel.LastName = this.regForm.get('lastName').value;
    this.regModel.Birthday = this.regForm.get('birthday').value;
    this.regModel.Email = this.regForm.get('email').value;
    this.regModel.HomePhone = this.regForm.get('phone').value;
    this.regModel.CellPhone = this.regForm.get('phone').value;
    this.regModel.Address1 = this.regForm.get('address').value;
    this.regModel.Zip = this.regForm.get('zip').value;
    this.regModel.UserName = this.regForm.get('username').value;
    this.regModel.Password = this.regForm.get('password').value;
    this.regModel.Channel = this.channelId;
    let regResp: any = await this.ds.registerUser(this.regModel);
    this.regError = regResp.Success;
    this.regErrorMsg = regResp.ErrorMessage;
    if(regResp.Success == true)  {
      this.regForm.reset();
      this.userId  = regResp.UserId;
      let questions: any = await this.ds.getQuestions(this.userId);
      questions.forEach((q) => {
        if(q.HasMultipleAnswers) {
          q.AnswerBools = [];
          q.AnswerOptions.forEach((a) => {
            q.AnswerBools.push(false)  
          })
        }
      });
      this.questions = questions;
    }
  }
  async nameAvailable() {
    if(!this.regForm.get('username').hasError('required')
      && !this.regForm.get('username').hasError('pattern')
      && !this.regForm.get('username').hasError('minlength')
      && !this.regForm.get('username').hasError('maxlength')
      && (this.regForm.get('username').dirty || this.regForm.get('username').touched)) {
        this.userNameAvailable = await this.ds.userNameAvailable(this.regForm.get('username').value)
      }
  }
  async emailAvailable() {
    if(!this.regForm.get('email').hasError('required')
      && !this.regForm.get('email').hasError('pattern')
      && (this.regForm.get('email').dirty || this.regForm.get('email').touched)) {
        this.emailAvailableToReg = await this.ds.emailAvailable(this.regForm.get('email').value)
      }
  }
  async submitQuestions() {
    let covidAnswers: any = {
      UserName: this.regModel.UserName,
      Password: this.regModel.Password,
      COVIDQuestions: this.questions
    }
    let subResp: any = await this.ds.submitAnswers(covidAnswers);
    // console.log(subResp)
    this.complete = subResp.Success;
    this.regModel = this.cleanModel();
  }
  getVersion() {
    this.ds.getVersion();
  }
  next() {
    if(this.questionIndex + 1 < this.questions.length) {
      if(this.questionIndex === 1) {
        if(this.testDate) {
          let testDate = this.testDate.split('-');
          this.questions[1].Answers[0] = parseInt(testDate[1]);
          this.questions[2].Answers[0] = parseInt(testDate[2].substring(0,2));
          this.questions[3].Answers[0] = testDate[0];
        }
        this.questionIndex = 4;
      } else if(this.questionIndex === 4) {
        if(this.symptomDate) {
          let symptomDate = this.symptomDate.split('-');
          this.questions[4].Answers[0] = parseInt(symptomDate[1]);
          this.questions[5].Answers[0] = parseInt(symptomDate[2].substring(0,2));
          this.questions[6].Answers[0] = symptomDate[0];
        }
        this.questionIndex = 7;
      } else {
        this.questionIndex++;
      }
    }
  }
  previous() {
    if(this.questionIndex-1 >= 0) {
      if(this.questionIndex===4) {
        this.questionIndex = 1;
      } else if(this.questionIndex === 7) {  
        this.questionIndex = 4;
      } else {
        this.questionIndex--;
      }
    }
  }
}
