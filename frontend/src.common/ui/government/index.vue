<template>
    <v-layout class="ballot" justify-center>
        <v-layout column justify-center class="president" v-if="pres">
            <plaque president/>
            <span class="title name">{{ pres.name }}</span>
        </v-layout>

        <v-layout column justify-center class="chancellor" v-if="chan">
            <plaque chancellor/>
            <span class="title name">{{ chan.name }}</span>
        </v-layout>                
    </v-layout>
</template>

<script>
import { mapGetters } from 'vuex';

import Plaque from './plaque';

export default {
    components: {
        Plaque,
    },

    props: {
        government: { type: Object, default: null },
        president: { type: Object, default: null },
        chancellor: { type: Object, default: null },
    },

    computed: {
        ...mapGetters({
            getPlayer: 'getPlayer',
        }),
        
        pres() {
            let value;
            if (this.president)
                value = this.president;

            else if (this.government)
                value = this.government.president;

            if (typeof value == 'number')
                return this.getPlayer(value);

            return value;
        },

        chan() {
            let value;
            if (this.chancellor)
                value = this.chancellor;

            else if (this.government)
                value = this.government.chancellor;

            if (typeof value == 'number')
                return this.getPlayer(value);

            return value;
        },
    }
};
</script>

<style module lang="less">
@import "~style";

.ballot {
    flex: 0 0 auto;
    padding: @spacer (@spacer * 0.5) (@spacer * 0.5);
}

.president, .chancellor {
    max-width: 60vw;
    // width: 60%;
    padding: 0 (@spacer * 0.5);

    .name {
        margin: (@spacer * 0.5) 0 (@spacer * 0.5) 0;
        align-self: center;
    }
}
</style>