<template>
    <div class="col s12 m6 l4 loguinForm" style="">
        <div class="col s12 card-panel center">
            <form v-on:submit.prevent="userloguin()">
                <b v-show="error!==''">{{ $t("login.errors."+error) }}</b>
                <div class="row">
                    <md-input
                            name="username"
                            :value.sync="user.username"
                    >
                        {{ $t("login.username") }}
                        <template slot="icon-name">account_circle</template>
                    </md-input>
                    <md-input
                            type="password"
                            name="password"
                            :value.sync="user.password"
                    >
                        {{ $t("login.password") }}
                        <template slot="icon-name">lock</template>
                    </md-input>
                </div>
                <div class="row">
                    <div class="input-field col s12">
                        <md-btn class="btn waves-effect waves-light col s12" type="submit">
                            {{ $t("login.title") }}
                        </md-btn>
                    </div>
                    <div class="input-field col s12">
                        <p class="margin center medium-small sign-up"><a v-link="{name: 'register'}">{{
                            $t("login.createaccount") }}</a></p>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
<script>
import UserService from '../../../services/user'
import Storage from '../../../services/lstorage'
export default {
  route: {
    canActivate: function (transition) {
      return UserService.user_acces('authenticate') ? transition.redirect('/home') : true
    }
  },
  data () {
    return {
      user: {
        username: '',
        password: ''
      },
      error: ''
    }
  },
  methods: {
    userloguin () {
      this.error = 'consultando'
      UserService.authenticate(this, this.user).then(r => {
        if (r.status === 200) {
          return r.text()
        } else {
          return r.text().then(d => {
            throw d
          })
        }
      })
			.then(json => {
  const data = JSON.parse(json)
  Storage.set('token', data.token)
  UserService.setUser(data.data)
  this.$dispatch('userLoguin', 'user loguin')
  window.location.reload()
}).catch(err => {
  this.error = err.text()
})
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@-ms-viewport {
  width: device-width;
}
 .loguinForm{
  margin-left: 33% !important;
 }
@media screen and ( max-width: 782px ) {
 .loguinForm{
  margin-left: 2% !important;
 }
}

</style>