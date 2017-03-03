<template>
    <div class="row">

        <div class="col s12 m12">
            <md-collection>
                <md-collection-item href="javascript:void(0)">{{ $t("account.personalData.name") }}
                    <md-badge>{{user.name}} {{user.fistlastname}} {{ user.secondlastname }}</md-badge>
                </md-collection-item>
                <md-collection-item href="javascript:void(0)">{{ $t("account.personalData.username") }}
                    <md-badge :alert="user.username"></md-badge>
                </md-collection-item>
                <md-collection-item href="javascript:void(0)">{{ $t("account.personalData.email") }}
                    <md-badge>{{user.email}}</md-badge>
                </md-collection-item>
                <md-collection-item href="javascript:void(0)">{{ $t("account.personalData.created") }}
                    <md-badge>{{ user.created | moment 'MMMM Do YYYY, h:mm:ss a'}}</md-badge>
                </md-collection-item>

            </md-collection>
        </div>
    </div>

</template>

<script>
export default {
  name: 'PersonalData',
  props: {
    user: {
      type: Object
    }
  },
  data () {
    return {
    }
  },
  methods: {
    imageUrl (name) {
      return this.dirServer + '/uploads/' + name
    }
  }
}
</script>