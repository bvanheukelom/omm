/**
 * Created by bert on 27.09.16.
 */
export class Session{
    userData:any;

    constructor(ud:any){
        this.userData = ud;
    }
    [otherProps:string]:any;
}