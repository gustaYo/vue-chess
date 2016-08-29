(() => {
  'use strict';
  let cluster = require('cluster');
  let config = require('./config.js');
  let runServer = () => {
      require('./app')(process.cwd(), config, app => {
        app.listen(config.porthttp)
      });
  }
  if (config.multicore) {
    // Condition that checks if we are on the master process,
    // before creating child processes.
    if (cluster.isMaster) {
      // Fork all the workers.
      const numCPUs = require('os').cpus().length;
      console.log('numCPUs',numCPUs)
      //  / (parseInt(process.env.CLUSTER_DIVIDER, 10) || 1);
      console.log('Process Master', process.pid);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }

      Object.keys(cluster.workers).forEach(id => {
        console.log('Running with process ID: ', cluster.workers[id].process.pid);
      });

      // arguments are worker, code, signal
      cluster.on('exit', worker => {
        const RESTART_DELAY = parseInt(process.env.RESTART_DELAY, 10) || 30000;
        console.log('Process ID: ' + worker.process.pid +
          ' died, creating new worker in ' +
          (RESTART_DELAY / 1000) + ' seconds');
        setTimeout(cluster.fork, RESTART_DELAY);
      });
      var allClustersData = {}
      cluster.on('message', function(someData){
        allClustersData[someData.name] = someData.data
        console.log('everywell',allClustersData)
      })
    } else {
      runServer()
    }
  } else {
    runServer()
  }
})();
