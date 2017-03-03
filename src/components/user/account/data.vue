<template>
  <div>
    <personal-data :user="user"></personal-data>
    <md-button
            class="waves-effect waves-light"
            v-if="thisuser.username === user.username"
            v-link="{name: 'edituser'}"
    >
      <md-icon right>cloud</md-icon>
      {{ $t("account.personalData.edit") }}
    </md-button>

  </div>
</template>
<script>
import PersonalData from './personalData'
import { getUser } from '../../../vuex/getters'
import UserService from '../../../services/user'
export default {
  vuex: {
    getters: {
      user: getUser
    }
  },
  data () {
    return {
      thisuser: UserService.user
    }
  },
  components: {
    PersonalData
  }
}
</script>