class FrontRouter {

    constructor() {
        this.routes = {};  // Initialize routes with an empty object

        // Listen for popstate events
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    }

    // Function to navigate to a specific route
    navigate(path) {
        console.log(path);

        history.pushState(null, null, path);
        this.handleRoute();  // Handle the route after navigating
    }

    // Function to handle the current route
    handleRoute() {
        const path = window.location.pathname.toLowerCase();
        console.log(`Navigated to ${path}`);

        const matchingRoute = this.routes[path] || this.routes['404'];
        if (matchingRoute) {
            matchingRoute.PreRender();
        } else {
            console.warn('No matching route found');
        }
    }

    // Function to set the routes
    setRoutes(routes) {
        this.routes = routes;
        this.handleRoute();  // Handle route after setting routes
    }

}

// create global instance variables

export const frontRouter = new FrontRouter();