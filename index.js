var
    Resource = require('deployd/lib/resource'),
    querystring = require('querystring'),
    util = require('util'),
    url = require('url');

function Proxy(name, options) {
    Resource.apply(this, arguments);
}
util.inherits(Proxy, Resource);
module.exports = Proxy;

Proxy.prototype.clientGeneration = true;

Proxy.prototype.handle = function (ctx, next) {
    if(ctx.req && ctx.req.method !== 'GET') return next();

    var urlObj = url.parse(this.config.url + ctx.url);
    urlObj.query = querystring.parse(url.parse(ctx.req.url).query);

    var paramsObj = querystring.parse(this.config.params);

    for (var property in paramsObj)
        urlObj.query[property] = paramsObj[property];

    requestOptions = url.parse(url.format(urlObj));
    requestOptions.method = ctx.req.method;

    if (ctx.req.headers && ctx.req.headers.accept) {
        requestOptions.headers = requestOptions.headers || {};
        requestOptions.headers.Accept = ctx.req.headers.accept;
    }

    if (this.config.username) {
        requestOptions.headers = requestOptions.headers || {};
        requestOptions.headers.Authorization = 'Basic ' + new Buffer(this.config.username + ':' + this.config.password).toString('base64');
    }

    var client;

    if (requestOptions.protocol === 'https:')
        client = require('https');
    else
        client = require('http');

    var proxy_request = client.request(requestOptions, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            ctx.res.write(chunk);
        });
        res.on('end', function (chunk) {
            ctx.res.end();
        });
    });

    proxy_request.on('error', function (err) {
        console.error(err);
        // Bad request
        ctx.res.statusCode = 400;
        ctx.res.end();
    });

    proxy_request.on('error', function (err) {
        console.warn(err);
    });

    ctx.req.addListener('data', function(chunk) {
        proxy_request.write(chunk, 'binary');
    });

    ctx.req.addListener('end', function() {
        proxy_request.end();
    });
};

Proxy.basicDashboard = {
  settings: [
  {
    name        : 'url',
    type        : 'text',
    description : 'the url'
  }, {
    name        : 'username',
    type        : 'text',
    description : 'HTTP username'
  }, {
    name        : 'password',
    type        : 'text',
    description : 'HTTP password'
  }, {
    name        : 'params',
    type        : 'text',
    description : 'Extra query string params'
  }]
};
