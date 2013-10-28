# Deployd Proxy Resource

This custom resource type allows you to forward requests to another server.

## Installation

`$ npm install dpd-proxy`

See [Installing Modules](http://docs.deployd.com/docs/using-modules/installing-modules.md) for details.

## Configuration

Before using the proxy resource, you must go to its Dashboard page and configure it.

### Required settings:

**host**  
The hostname of your SMTP provider.

### Optional settings:

**username**  
HTTP Basic Auth username.

**password**  
HTTP Basic Auth password.
