<script>
import Vue from 'vue'
import UserService from '../../services/user'
import Store from '../../services/lstorage'
import BoardVisor from './boardVisor'
import UploadFiles from './uploadFiles'
import BodyMen from './bodyMen'
import Jquery from 'jquery'
import toast from 'vue-material-components'
export default {
  route: {
    canActivate: function (transition) {
      return UserService.user_acces('authenticate') ? true : transition.redirect('user/loguin')
    }
  },
  template: require('./template.html'),
  data () {
    return {
      finduser: '',
      dirActionUpload: Store.get('serverDir') + '/chat/upload',
      dirServer: Store.get('serverDir'),
      filesUpload: [],
      fileProgress: 0,
      allFilesUploaded: true,
      offcanvas: false,
      active: 'boardVisor',
      tab: '0',
      tabs: [],
      chattext: '',
      user: UserService.user,
      boards: [],
      newboard: {
        color: 'w',
        time: '3',
        public: true
      },
      users: [],
      usersLength: 0,
      games: [],
      board: Store.get('boardSee', {})
    }
  },
  mixins: [
    toast
  ],
  events: {
    users (data) {
      this.users = data.nicknames
    },
    boards (data) {
      this.boards = data.boards
    },
    mensaje (data) {
      this.recibeMensaje(data.men, true)
    },
    onFileClick (file) {
      // console.log('onFileClick', file)
    },
    onFileChange (file) {
      // console.log('onFileChange', file)
      // here is where we update our view
      this.fileProgress = 0
      this.allFilesUploaded = false
    },
    beforeFileUpload (file) {
      // called when the upload handler is called
      // console.log('beforeFileUpload', file)
    },
    afterFileUpload (file) {
      // called after the xhr.send() at the end of the upload handler
      // console.log('afterFileUpload', file)
    },
    onFileProgress (progress) {
      // console.log('onFileProgress', progress)
      // update our progress bar
      this.fileProgress = parseInt(progress.percent)
    },
    onFileUpload (file, res) {
      // console.log('onFileUpload', file, res)
      this.chattext = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModifiedDate: file.lastModifiedDate
      }
      this.sendMensaje('file')
    },
    onFileError (file, res) {
      this.toast('<span>Error ' + res + '</span>', 3000)
      // console.error('onFileError', file, res)
    },
    onAllFilesUploaded (files) {
      // console.log('onAllFilesUploaded', files)
      this.toast('<span>' + Vue.t('home.uploadMens.success') + '</span>', 2000)
      // everything is done!
      this.allFilesUploaded = true
    }
  },
  props: {},
  computed: {},
  components: {
    BoardVisor,
    UploadFiles,
    BodyMen
  },
  methods: {
    imageUrl (name) {
      return this.dirServer + '/uploads/' + name
    },
    userScroll (e) {
      var scrollTop = e.target.scrollTop
      // var scrollWidth = e.target.scrollWidth
      // var scrollHeight = e.target.scrollHeight
      // var clientHeight = e.target.clientHeight
      // console.log(scrollTop, scrollWidth, scrollHeight, clientHeight)
      if (scrollTop === 0) {
        var post = this.foundTab(this.active)
        // console.log('cargar historial anterior', this.active)
        var parmsLoad = {
          user: this.active,
          range: {
            limit: 30,
            skip: this.tabs[post].men.length
          }
        }
        this.loadUserConvert(parmsLoad, true)
      }
    },
    isAtBottom () {
      if (this.active === 'boardVisor') {
        return
      }
      var tabConvert = document.getElementById('content_' + this.active)
      if (true) {
        var atBottom = tabConvert.scrollTop >= tabConvert.scrollHeight - tabConvert.clientHeight
        if (atBottom) {
          this.scrollBottom()
        }
      }
    },
    scrollBottom () {
      Jquery('#content_' + this.active).animate({
        'scrollTop': Jquery('#content_' + this.active)[0].scrollHeight
      }, 'slow')
    },
    toogleOfCanvas () {
      this.offcanvas = !this.offcanvas
    },
    openTab (user, active = true) {
      clearTimeout(window.computerGame)
      var tabConvert = {
        name: user.nickname,
        idTab: user.nickname,
        men: []
      }
      if (!this.foundTab(tabConvert.idTab)) {
        this.tabs.push(tabConvert)
        var parmsLoad = {
          user: tabConvert.idTab,
          range: {
            limit: 30,
            skip: 0
          }
        }
        this.loadUserConvert(parmsLoad)
      }
      if (active) {
        this.active = tabConvert.idTab
      }
    },
    foundTab (tab) {
      for (var i in this.tabs) {
        if (this.tabs[i].idTab === tab) {
          return i
        }
      }
      return false
    },
    closeTab (tab) {
      var post = this.foundTab(tab)
      this.tabs.splice(post, 1)
      if (this.tabs.length === 0) {
        this.active = 'boardVisor'
      } else {
        if (this.active === this.tabs[this.tabs.length - 1].idTab) {
          this.active = 'nnn'
        }
        setTimeout(function () {
          this.active = this.tabs[this.tabs.length - 1].idTab
        }.bind(this), 200)
      }
      var data = {
        c: 'chat',
        f: 'removeConversation',
        data: {
          user: UserService.getUser().username,
          conver: tab
        }
      }
      this.$socket.emit('event', data, function (...callbacks) {
        // console.log('conversacion cerrada')
      })
    },
    showBoard (board) {
      this.board = board
      Store.set('boardSee', board)
      this.active = 'boardVisor'
    },
    desactiveBoard () {
      this.board = {}
      setTimeout(function () {
        this.active = 'boardVisor'
      }.bind(this), 200)
    },
    sendMensaje (type = 'text') {
      if (type === 'text') {
        if (this.chattext.trim() === '') {
          this.chattext = ''
          return
        }
      }
      var post = this.foundTab(this.active)
      var men = {
        body: this.chattext,
        type: type,
        public: false,
        send: UserService.getUser().username,
        recibe: this.tabs[post].idTab
      }
      var data = {
        c: 'chat',
        f: 'mensaje',
        data: {
          men: men
        }
      }
      this.$socket.emit('event', data, function (...callbacks) {
        // console.log(callbacks)
      })
      this.chattext = ''
    },
    recibeMensaje (men, bottom = false) {
      var tabUser = men.send === UserService.getUser().username ? men.recibe : men.send
      var post = this.foundTab(tabUser)
      if (post) {
        this.tabs[post].men.push(men)
      } else {
        var tabConvert = {
          name: tabUser,
          idTab: tabUser,
          men: [men]
        }
        this.tabs.push(tabConvert)
        var active = this.active
        setTimeout(function () {
          this.active = active
        }.bind(this), 200)
      }
      if (bottom) {
        this.isAtBottom()
      }
    },
    loadAllData () {
      var data = {
        c: 'chat',
        f: 'getDataChat',
        data: {
          user: UserService.getUser()
        }
      }
      setTimeout(function () {
        this.$socket.emit('event', data, function (...callbacks) {
          var logUser = callbacks[1].logUser
          for (var i = 0; i < logUser.length; i++) {
            if (logUser[i]) {
              this.openTab({nickname: logUser[i]}, false)
              var parmsLoad = {
                user: logUser[i],
                range: {
                  limit: 30,
                  skip: 0
                }
              }
              this.loadUserConvert(parmsLoad)
            }
          }
          this.boards = callbacks[1].boards
        }.bind(this))
      }.bind(this), 500)
    },
    loadUserConvert (parms, historyTop = false) {
      var data = {
        c: 'chat',
        f: 'loadUserConvert',
        data: parms
      }
      this.$socket.emit('event', data, function (...callbacks) {
        var log = callbacks[1]
        if (historyTop) {
          // adiciona mensajes al principio de la conversacion
          var post = this.foundTab(this.active)
          if (log.length > 0) {
            Jquery('#content_' + this.active).animate({
              'scrollTop': 100
            }, 'slow')
          }
          var menHistory = log.concat(this.tabs[post].men)
          this.tabs[post].men = menHistory
        } else {
          for (var i = log.length - 1; i >= 0; i--) {
            this.recibeMensaje(log[i])
          }
        }
      }.bind(this))
    },
    activeWebcam () {
      this.toast('<span>No implement yet</span>', 2000)
    },
    inviteChessGame () {
      this.$broadcast('modal::open', 'inviteGame')
    },
    createdInviteGame (result) {
      if (result) {
        var invite = {
          type: 'invite',
          public: false,
          time: this.newboard.time,
          recibe: this.active
        }
        if (this.newboard.color === 'w') {
          invite.u1 = UserService.getUser().username
          invite.u2 = this.active
        } else {
          invite.u2 = UserService.getUser().username
          invite.u1 = this.active
        }
        var data = {
          c: 'board',
          f: 'inviteGame',
          data: {
            event: 'inviteGame',
            data: invite
          }
        }
        this.toast('<span>' + Vue.t('home.inviteSend') + '</span>', 2000)
        this.$socket.emit('event', data, function (...callbacks) {
          // console.log(callbacks)
        })
      }
      this.$broadcast('modal::close', 'some', 'inviteGame')
    }
  },
  created () {
    setTimeout(function () {
      this.active = 'boardVisor'
      this.loadAllData()
    }.bind(this), 1000)
    this.$dispatch('userLoguin', 'show data')
  }
}
</script>
