var 
    Resource = require('deployd/lib/resource'), 
    querystring = require('querystring'),
    util = require('util'),
    http = require('http'),
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

    urlObj = url.parse(url.format(urlObj));
    
    var requestOptions = {
        hostname : urlObj.host,
        port : urlObj.port || 80,
        path : urlObj.path,
        method : ctx.req.method,
        headers: {
            'Authorization': 'Basic ' + new Buffer(this.config.username + ':' + this.config.password).toString('base64')
        }    
    };
    
    var proxy_request = http.request(requestOptions, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            ctx.res.write(chunk);
        });
        res.on('end', function (chunk) {
            ctx.res.end();
        });
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

