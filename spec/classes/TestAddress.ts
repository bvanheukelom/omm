/**
 * Created by bert on 04.05.15.
 */
import * as omm from "../../src/omm"
import * as Tests from "./Tests"

@omm.Entity
/**
 * @Internal
 */
export class TestAddress {
    street:string;

    @omm.Parent
    person:Tests.TestPerson;

    constructor(street:string, person?:Tests.TestPerson) {
        this.street = street;
        this.person = person;
    }

    getStreet():string {
        return this.street;
    }
}
