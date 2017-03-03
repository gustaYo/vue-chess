<template>
  <div class="col s12 m12 l12">
    <md-modal id="initGame">
      <h4 style="text-align: center">{{ $t("invites.initgame") }}</h4>
      <div class="col s12 m12 l12" style="text-align: center">
        <h1>{{ counterInitGame }}</h1>
      </div>
    </md-modal>
    <md-modal bottom id="invitesGame">
      <p class="flat-text-header">{{ $t("invites.numIn") }} {{ invitesGame.length }}</p>
      <div class="col s12 m12 l12 flat-text-header">
        <a class="btn waves-effect waves-light col s3 m3 l1" @click="pcGameInit">
          {{ $t("invites.vspc") }}
        </a>
      </div>
      <md-collection class="col s12 m12 l12">
        <md-collection-item class="col s6 m6 l6 avatar" v-for="invite in invitesGame">
          <img style="top: 20px;" src="../../assets/50x50defaultAvatar.png" alt="" class="circle">
          <span class="title"> {{ invite.u1 }} <img style="height: 50px;"
                                                    src="../../../static/images/pieces/staunton/basic/White-Queen.png"
                                                    alt=""> VS <img style="height: 50px;"
                                                                    src="../../../static/images/pieces/staunton/basic/Black-Queen.png"
                                                                    alt=""> {{ invite.u2 }}</span>
          <p>Tiempo: {{ invite.time }} minutos {{[invite.event === 'confirmGame'? 'confirmando Iniciar ...': '']}}</p>

          <a class="secondary-content" @click="InviteGameAction(invite)"><i class="material-icons">grade</i></a>
          <a class="secondary-content" style="top: 50px" @click="deleteInvite(invite)"><i
                  class="material-icons">delete</i></a>
        </md-collection-item>
      </md-collection>
    </md-modal>
    <md-modal id="invitePCGame">
      <h4 style="text-align: center">HUMAN VS PC</h4>
      <div class="col s12 m12 l12">
        <div class="col s6 m4 l4">
          <p class="flat-text-header hello">Color</p>
          <md-radio-group group="color" class="col s6">
            <md-radio :value.sync="newboard.color" radio-value="w" class="with-gap">
              {{ $t("home.createPart.white") }}
            </md-radio>
            <md-radio :value.sync="newboard.color" radio-value="b" class="with-gap">
              {{ $t("home.createPart.black") }}
            </md-radio>
          </md-radio-group>
        </div>
      </div>
<span slot="footer">
  <md-button href="#" class="waves-effect waves-green btn-flat"
             @click="createdVsPcGame(true)">
  {{ $t("home.createPart.create") }} 
</md-button>
<md-button href="#" class="waves-effect waves-green btn-flat"
           @click="createdVsPcGame(false)">
{{ $t("home.createPart.cancel") }} 
</md-button>
</span>
    </md-modal>

    <style scoped>
      .confirmInvite {
        background-color: #658c8c !important;
      }
    </style>
  </div>
</template>

<script>
import Store from '../../services/lstorage'
import UserService from '../../services/user'
import toast from 'vue-material-components'
export default {
  name: 'UserInvites',
  data () {
    return {
      invitesGame: Store.get('invitesGame', []),
      counterInitGame: 3,
      newboard: {
        color: 'w',
        time: '3',
        public: true
      }
    }
  },
  mixins: [
    toast
  ],
  methods: {
    initGame (game) {
      this.$route.router.go('/')
      Store.set('board', game)
      this.$broadcast('modal::open', 'initGame')
      var setIn = 1
      this.$broadcast('modal::close', 'some', 'invitesGame')
      setIn = setInterval(function () {
        if ((this.counterInitGame - 1) === 0) {
          clearInterval(setIn)
          this.$broadcast('modal::close', 'some', 'initGame')
          this.counterInitGame = 3
          this.$route.router.go('/game')
        } else {
          this.counterInitGame --
        }
      }.bind(this), 1000)
    },
    testUser (next) {
      UserService.testUser(this, {}).then(function (response) {
        UserService.setUser(response.data)
        next()
      }, function (response) {
        this.error = response.data
      })
    },
    InviteGameAction (invite) {
      // preparar tablero
      var data = {
        c: 'board',
        f: 'confirmGame',
        data: invite
      }
      if (invite.confirm || invite.vsPc) {
        data.f = 'addBoard'
        this.deleteInvite(invite)
      } else {
        this.toast('<span>Esperando confirmacion de usuario</span>', 2000)
      }
      this.$socket.emit('event', data, function (...callbacks) {
        if (callbacks[0]) {
          window.alert(callbacks[0])
        }
      })
      // this.deleteInvite(invite)
      // eliminar invitacion del arreglo
    },
    deleteInvite (invite) {
      var post = this.invitesGame.indexOf(invite)
      if (post !== -1) {
        this.invitesGame.splice(post, 1)
        Store.set('invitesGame', this.invitesGame)
        this.toast('<span>Eliminada correctamente</span>', 2000)
      }
    },
    pcGameInit () {
      this.$broadcast('modal::open', 'invitePCGame')
      this.$broadcast('modal::close', 'some', 'invitesGame')
    },
    createdVsPcGame (state) {
      if (!state) {
        this.$broadcast('modal::close', 'some', 'invitePCGame')
        return
      }
      this.$broadcast('modal::close', 'some', 'invitePCGame')
      var invite = {
        u1: '',
        u2: '',
        public: false,
        vsPc: true,
        time: '30',
        confirm: false,
        created: new Date().getTime()
      }
      if (this.newboard.color === 'w') {
        invite.u1 = UserService.user.username
        invite.u2 = 'PC'
      } else {
        invite.u2 = UserService.user.username
        invite.u1 = 'PC'
      }
      this.InviteGameAction(invite)
    },
    isAdding (invite) {
      for (var i in this.invitesGame) {
        if (this.invitesGame[i].created === invite.created) {
          return true
        }
      }
      return false
    }
  },
  events: {
    inviteGame (data) {
      this.invitesGame.push(data)
      Store.set('invitesGame', this.invitesGame)
      this.toast('<span>Tienes una nueva invitacion de juego</span>', 5000)
    },
    confirmGame (data) {
      if (!this.isAdding(data)) {
        this.invitesGame.push(data)
      }
      Store.set('invitesGame', this.invitesGame)
      this.$broadcast('modal::open', 'invitesGame')
      this.toast('<span>Invitacion de juego confirmada</span>', 5000)
    },
    initGame (data) {
      // inicializando un tablero
      this.initGame(data)
    }
  }
}
</script>