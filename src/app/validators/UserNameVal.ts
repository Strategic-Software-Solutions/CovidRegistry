import { FormControl } from '@angular/forms';

export class UsernameValidator {
  static validUsername(fc: FormControl){
    if(fc == undefined || fc.value == undefined || fc == null || fc.value == null)
      return ({validUsername: true});

    if(fc.value.toLowerCase() === "abc123" || fc.value.toLowerCase() === "123abc"){
      return ({validUsername: true});
    } else {
      return (null);
    }
  }
}