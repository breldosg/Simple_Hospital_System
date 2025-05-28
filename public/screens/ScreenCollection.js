import { dashboardScreen } from "./dashboardScreen.js";
import { loginScreen } from "./LoginScreen.js";
import { PrintScreen } from "./PrintScreen.js";


export class ScreenCollection {

    loginScreen = new loginScreen();
    dashboardScreen = new dashboardScreen();
    printScreen = new PrintScreen();

}

export const screenCollection = new ScreenCollection();
