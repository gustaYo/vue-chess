import Vue from 'vue'
import App from './App'
import Resource from 'vue-resource'
import Router from 'vue-router'
import VueMaterialComponents from 'vue-material-components'
import Home from 'components/home/'
// import Multiplayer from 'components/multiplayer/'
// import CreateServer from 'components/createServer/'
import UserLoguin from 'components/user/loguin/'
import UserRegister from 'components/user/register/'
import UserAccount from 'components/user/account/'
import Puzzle from 'components/puzzles/'
import '../static/style.css'
import '../static/base.css'
import '../static/desktop.css'
import '../static/theme.css'
import '../static/css/google-icons/icon.css'
import '../static/css/materialize.min.css'
import 'vue-material-components/dist/vue-material-components.css'
import '../static/css/myStyles.css'
import '../static/css/animate.min.css'
// Install plugins
import Storage from './services/lstorage'
import UserService from './services/user'
import VueSocketIO from 'vue-socket.io'
import SocketIO from 'socket.io-client'
Vue.use(VueMaterialComponents)
Vue.use(Router)
Vue.use(Resource)
// Vue.http.headers.common['Authorization'] = 'Basic YXBpOnBhc3N3b3Jk'
Vue.http.interceptors.push((request, next) => {
  // modify request
  var token = Storage.get('token')
  if (token) {
    request.headers['Authorization'] = 'Bearer ' + token
  }
  // continue to next interceptor
  next((response) => {
    // modify response
    if (response.status === 401 || response.status === 403) {
      // desloguear user
      UserService.logout()
    }
  })
})
Storage.setPrefix('chessVuex')
UserService.init()
Vue.http.options.root = Storage.get('serverDir')
Vue.filter('timeBoard', function (s) {
  var min = parseInt(s / 60)
  var segs = s % 60
  return ('0' + min).slice(-2) + ':' + ('0' + segs).slice(-2)
})
var Dev = true
var dirServer = Dev ? 'https://' + window.location.hostname + ':3311' : window.location.origin
dirServer = Storage.set('serverDir', dirServer)
if (Storage.get('token')) {
  var socket = SocketIO.connect(Storage.get('serverDir'), { query: 'token=' + 'Bearer ' + Storage.get('token') })
  Vue.use(VueSocketIO, socket)
}
Vue.transition('entern', {
  enterClass: 'pulse',
  leaveClass: 'invisible'
})
// Set up a new router
var router = new Router()
// Route config
router.map({
  '/home': {
    name: 'home',
    component: Home
  },
  '/user': {
    name: 'user',
    component: {
      template: '<div><router-view></router-view></div>'
    },
    subRoutes: {
      '/': {
        component: UserAccount
      },
      '/register': {
        name: 'register',
        component: UserRegister
      },
      '/loguin': {
        name: 'loguin',
        component: UserLoguin
      }
    }
  },
  /*
  '/multiplayer': {
    name: 'multiplayer',
    component: Multiplayer
  },
  '/createServer': {
    name: 'createServer',
    component: CreateServer
  },
  */
  '/game': {
    name: 'game',
    component (resolve) {
    // cargar a demanda
      require(['./components/game/'], resolve)
    }
  },
  '/visor/:idBoard/:skip/:u1/:u2': {
    name: 'visor',
    component (resolve) {
    // cargar a demanda
      require(['./components/boardVisor/'], resolve)
    }
  },
  '/puzzle': {
    name: 'puzzle',
    component: Puzzle
  }
})
// For every new route scroll to the top of the page
router.beforeEach(function () {
  window.scrollTo(0, 0)
})
// If no route is matched redirect home
router.redirect({
  '*': '/home'
})
// Start up our app
router.start(App, '#app')
