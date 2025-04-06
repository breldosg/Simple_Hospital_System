class FrontRouter {

    constructor() {
        this.routes = {};  // Initialize routes with an empty object
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    }

    // Function to navigate to a specific route
    navigate(path) {
        history.pushState(null, null, path);
        this.handleRoute();  // Handle the route after navigating
    }

    // Function to handle the current route
    handleRoute() {
        const path = window.location.pathname.toLowerCase();

        // Find a matching route or return 404
        const matchingRoute = this.matchRoute(path);
        if (matchingRoute) {
            // update the title of the page
            document.title = matchingRoute.route.title;

            matchingRoute.route.view.PreRender(matchingRoute.params);
        } else {
            console.warn('No matching route found');
            this.routes['404'].PreRender();
        }
    }

    // Function to set the routes
    setRoutes(routes) {
        this.routes = routes;
        this.handleRoute();  // Handle route after setting routes
    }

    // Function to match dynamic routes and extract parameters
    matchRoute(path) {
        for (let route in this.routes) {
            // Convert route to a regex, replacing :param with a capturing group
            const paramNames = [];
            const regexPath = route.replace(/\/:([^/]+)/g, (match, paramName) => {
                paramNames.push(paramName);
                return '/([^/]+)';
            });
            const regex = new RegExp(`^${regexPath}$`);

            // Test the current path against the regex
            const match = path.match(regex);
            if (match) {
                // Extract parameter values
                const params = paramNames.reduce((acc, paramName, index) => {
                    acc[paramName] = match[index + 1];  // Get corresponding matched value
                    return acc;
                }, {});

                return { route: this.routes[route], params };
            }
        }

        return null;  // No matching route found
    }
}
export const frontRouter = new FrontRouter();