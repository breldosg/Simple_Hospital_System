const set_cookie = (res, data) => {
    // console.log(data.token);
    var cookie_details = {
        name: "DougParTBlgtrsWtwkljYXNjYXNjYXNjcbi",
        token: data.token,
        days: 1
    }


    var expire_date = new Date(Date.now() + cookie_details.days * 24 * 60 * 60 * 1000);

    res.cookie(cookie_details.name, cookie_details.token, {
        expires: expire_date,
        priority: 'High',
        httpOnly: true
    });
    delete data.token;
    res.send(data);
}

const check_cookie = (req) => {
    // console.log(req.cookies);
    if (!req.cookies.DougParTBlgtrsWtwkljYXNjYXNjYXNjcbi) {
        return false;
    }
    else {
        return true;
    }
}

const get_cookie = (req) => {
    /**
     * This function accepts request as a parameter for getting the cookie
     * @callback req
     */
    const user_cookie = req.cookies.DougParTBlgtrsWtwkljYXNjYXNjYXNjcbi;
    if (user_cookie) {
        return user_cookie;
    }
    else {
        return null;
    }
}

const delete_cookie = (res) => {
    // Set the cookie's expiration date to a past date to delete it
    res.cookie('DougParTBlgtrsWtwkljYXNjYXNjYXNjcbi', '', { expires: new Date(0) });
    return true;

}

const user_agent_infos = (req) => {
    const userAgent = req.headers['user-agent'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var device_data = parseUserAgent(userAgent);
    device_data = { ...device_data, ip: ip };
    return device_data;

}

const parseUserAgent = (userAgent) => {
    const clientInfo = {
        os: 'Unknown',
        device: 'Unknown',
        browser: 'Unknown'
    };

    const osMap = {
        'Windows NT': 'Windows',
        'Mac OS X': 'MacOS',
        'Linux': 'Linux',
        'Android': 'Android',
        'like Mac OS X': 'iOS',
        'Macintosh': 'MacOS',
        'Mac': 'MacOS',
        'Linux': 'Linux',
        'Windows': 'Windows',
        'Ubuntu': 'Linux',
        'Debian': 'Linux',
        'Fedora': 'Linux',
        'Chrome OS': 'Chrome OS'
    };

    const deviceMap = {
        'Mobi': 'Mobile',
        'Tablet': 'Tablet',
        'Desktop': 'Desktop',
        'Macintosh': 'Desktop',
        'Mac': 'Desktop',
        'Linux': 'Desktop',
        'Windows': 'Desktop',
        'Ubuntu': 'Desktop',
        'Debian': 'Desktop',
        'Fedora': 'Desktop',
        'Chrome OS': 'Chrome OS',
        'like Mac OS X': 'iOS',
        'Android': 'Android',
        'BlackBerry': 'BlackBerry',
        'PalmOS': 'PalmOS',
        'SymbianOS': 'SymbianOS',
        'Windows Phone': 'Windows Phone',
        'Windows Mobile': 'Windows Mobile',
        'Windows CE': 'Windows CE',
        'Windows Mobile': 'Windows Mobile',
    };

    const browserMap = {
        'Chrome': 'Chrome',
        'Safari': 'Safari',
        'Firefox': 'Firefox',
        'MSIE': 'Internet Explorer',
        'Trident': 'Internet Explorer',
        'Edge': 'Edge'
    };

    if (userAgent) {
        // Detect Operating System
        for (const [key, value] of Object.entries(osMap)) {
            if (userAgent.includes(key)) {
                clientInfo.os = value;
                break;
            }
        }

        // Detect Device
        for (const [key, value] of Object.entries(deviceMap)) {
            if (userAgent.includes(key)) {
                clientInfo.device = value;
                break;
            }
        }
        if (clientInfo.device === 'Unknown') {
            clientInfo.device = 'Desktop';
        }

        // Detect Browser
        for (const [key, value] of Object.entries(browserMap)) {
            if (userAgent.includes(key)) {
                clientInfo.browser = value;
                break;
            }
        }
    }

    return clientInfo;
}

// const ApiHost = `http://192.168.1.203`;
const ApiHost = `http://api.simplehospital.com`;

const RequestHandler = async (req, key, body) => {
    if (check_cookie(req)) {
        const user_cookie = get_cookie(req);
        const user_infos = JSON.stringify(user_agent_infos(req));
        const bodySend = body ? body : null;

        const body_data = {
            key: key,
            data: JSON.stringify(bodySend),
            user_agent_infos: user_infos,
        };

        try {
            const res2 = await fetch(ApiHost, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user_cookie}`
                },
                body: JSON.stringify(body_data)
            });


            if (!res2.ok) {
                console.error('API Error:', res2.statusText);
                return { success: false, message: 'Error from external API', errorCode: "500", status: 'error' };
            }

            const result = await res2.json();
            const { data, status, success } = result;

            return result;

        } catch (error) {
            console.error('Request Handler Error:', error);
            return { success: false, message: "Server error", errorCode: "500", status: "error" };
        }
    } else {
        return {
            success: false,
            message: "Unauthorized Access",
            status: "error",
            errorCode: "401"
        };
    }
};

/**
 * Creates a standardized route handler with error handling
 * @param {string} routeName - Name of the route for error logging
 * @param {number} handlerCode - Code to pass to RequestHandler
 * @returns {Function} Express route handler
 */
const createRouteHandler = (routeName, handlerCode) => {
    return async (req, res) => {
        try {
            // console.log(req);
            
            const result = await RequestHandler(req, handlerCode, req.body);
            if (result.status == 401) {
                console.log('token delete');
                
                // delete_cookie(res);
            }
            return res.status(200).json(result);
        } catch (error) {
            console.error(`Error in /${routeName} route:`, error);
            return res.status(500).json({
                success: false,
                message: 'Server error',
                status: 'error'
            });
        }
    };
};


const trailing_slashes = (req, res, next) => {
    if (req.path !== '/' && req.path.endsWith('/')) {
        // Redirect to the same URL without the trailing slash
        const newPath = req.path.slice(0, -1);
        return res.redirect(301, newPath + req.url.slice(req.path.length));
    }
    next();

};

module.exports = {
    set_cookie,
    check_cookie,
    get_cookie,
    user_agent_infos,
    delete_cookie,
    ApiHost,
    RequestHandler,
    trailing_slashes,
    createRouteHandler
}