import { dashboardScreen } from "./dashboardScreen.js";
import { loginScreen } from "./LoginScreen.js";


export class ScreenCollection {

    loginScreen = new loginScreen();
    dashboardScreen = new dashboardScreen();

}

export const screenCollection = new ScreenCollection();
