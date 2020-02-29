const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const browserstack = require('browserstack-local');
const ip = require('ip');
require('dot-env');
const proxyHost = process.env.PROXY_HOST;
const proxyPort = process.env.PROXY_PORT;
const bsUser = process.env.BS_USER;
const bsKey = process.env.BS_KEY;
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({
  static: '.'
});

server.use(middlewares);
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running')
});

// creates an instance of Local
const bs_local = new browserstack.Local();

// replace <browserstack-accesskey> with your key. You can also set an environment variable - "BROWSERSTACK_ACCESS_KEY".
const bs_local_args = {
  'key': bsKey
};
if (proxyHost !== '') {
    bs_local_args.proxyHost = proxyHost;
}
if (proxyPort !== '') {
    bs_local_args.proxyPort = proxyPort;
}

const targets = {
  'IE11' : {
    'browserName' : 'IE',
    'browser_version' : '11.0',
    'os' : 'Windows',
    'os_version' : '10',
    'resolution' : '1024x768'
  },
  'iOS11' : {
    'browserName': 'iPhone',
    'device': 'iPhone 8 Plus',
    'realMobile': 'true',
    'os_version': '11'
  },
  'Android10' : {
    'browserName' : 'android',
    'device' : 'Google Pixel 4 XL',
    'realMobile' : 'true',
    'os_version' : '10.0'
  }
}

async function run() {
  // starts the Local instance with the required arguments
  await new Promise((resolve) => {
    bs_local.start(bs_local_args, () => {
      resolve();
    });
  });
  Object.keys(targets).map(async (key) => {
    // Input capabilities
    let capabilities = {
      'browserstack.user' : bsUser,
      'browserstack.key' : bsKey,
      'browserstack.local' : 'true',
      'name' : `Bstack-[Node] : Sample Test ${key}`
    };
    capabilities = Object.assign(capabilities, targets[key]);
    let driver = new webdriver.Builder().
    usingServer('http://hub-cloud.browserstack.com/wd/hub').
    withCapabilities(capabilities);
    if (proxyHost !== '') {
      let proxy = `http://${proxyHost}`;
      if (proxyPort !== '') {
        proxy = `${proxy}:${proxyPort}`;
      }
      driver = driver.usingWebDriverProxy(proxy);
    }
    driver = driver.build();

    await driver.get(`http://${ip.address()}:3000/index_packed.html?appid=tatebayashi`);
    await driver.sleep(10000);
    const title = await driver.getTitle();
    console.log(title);
    const maplat = driver.findElement(By.className('maplat'));
    await driver.actions({bridge: true}).
      dragAndDrop(maplat, {x: 100, y: 100}).
      perform();
    await driver.sleep(10000);
    driver.quit();
  });
}

run();




/*var driver = new webdriver.Builder().
  usingServer('http://hub-cloud.browserstack.com/wd/hub').
  withCapabilities(capabilities).
  usingWebDriverProxy("http://172.16.231.132:15520").
  build();

driver.get('http://localhost:63342/Maplat/index.html?_ijt=npe7ic75hpl4apu1l04smak2mi#!s:morioka_ndl2/b:osm/x:-7105760.976961669/y:8695999.197015667/z:2.1459301282852747').then(function(){
  //driver.findElement(webdriver.By.name('q')).sendKeys('BrowserStack\n').then(function(){
    driver.getTitle().then(function(title) {
      console.log(title);
      driver.quit();
    });
  //});
});

// check if BrowserStack local instance is running
//console.log(bs_local.isRunning());

// stop the Local instance
/*bs_local.stop(function() {
  console.log("Stopped BrowserStackLocal");
});*/








