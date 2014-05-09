var forever = require('forever-monitor');

var child = new (forever.Monitor)('server.js', {
    max: 5,
    silent: true,
    options: [],
    'logFile': 'forever_out/log',
    'outFile': 'forever_out/child_out', // Path to log output from child stdout
    'errFile': 'forever_out/child_err'  // Path to log output from child stderr
});

child.on('watch:restart', function(info) {
    console.error('Restarting script because ' + info.file + ' changed');
});

child.on('restart', function() {
    console.error('Forever restarting script for ' + child.times + ' time');
});

child.on('exit:code', function(code) {
    console.error('Forever detected script exited with code ' + code);
});

child.start();