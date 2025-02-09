var Service = require('node-windows').Service;
var svc = new Service({
 name:'Simple Hospital Management System',
 description: 'Simple Hospital Management System',
 script: 'D:\\Code\\Simple_Hospital_System\\server.js'
});


svc.on('install',function(){
 svc.start();
});

svc.install();