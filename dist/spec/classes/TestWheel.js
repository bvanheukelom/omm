"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var omm = require("../../src/omm");
var TestWheel = (function () {
    function TestWheel() {
    }
    __decorate([
        omm.Parent
    ], TestWheel.prototype, "car", void 0);
    TestWheel = __decorate([
        omm.Entity("TestWheelBanzai")
    ], TestWheel);
    return TestWheel;
}());
exports.TestWheel = TestWheel;
//# sourceMappingURL=TestWheel.js.map