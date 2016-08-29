<template>

	<div class="row" style="margin-left: 30%;margin-right: 30%;margin-top: 50px;">
		<div class="col s12 card-panel center">    
     <form v-on:submit.prevent="userloguin()">
     {{ error }}
			<div class="row">    
				<md-input name="username" :value.sync="user.username">
				Usuario
				<template slot="icon-name">account_circle</template>
			</md-input>

			<md-input type="password" name="password" :value.sync="user.password" placeholder="password">
			Contraseña
			<template slot="icon-name">lock</template>
		</md-input>
	</div>
	<div class="row">
		<div class="input-field col s12">
        <md-btn class="btn waves-effect waves-light col s12" type="submit">
    Loguin
  </md-btn>		
		</div>
		<div class="input-field col s12">
			<p class="margin center medium-small sign-up"><a v-link="{name: 'register'}">Crear una cuenta</a></p>
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
      return UserService.user_acces('authenticate') ? transition.redirect('home') : true
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
      UserService.authenticate(this, this.user).then(function (response) {
        Storage.set('token', response.data.token)
        UserService.setUser(response.data.data)
        this.$dispatch('userLoguin', 'user loguin')
        window.location.reload()
      }, function (response) {
        this.error = response.data
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
	h1 {
		color: #42b983;
	}
</style>