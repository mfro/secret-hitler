<template>
    <v-layout class="ballot mb-2" column align-center>

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

import Plaque from '@/ui/plaque';

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
}

.president, .chancellor {
    width: 60%;
    margin-top: @spacer;

    .image {
        width: 100%;
        padding-top: 30%;
        background-size: cover;
        background-position: 0 0;
    }

    .name {
        margin: (@spacer * 0.5) 0 (@spacer * 0.5) 0;
        align-self: center;
    }
}

.president .image {
    background-image: url(../assets/plaque/president.png);
}

.chancellor .image {
    background-image: url(../assets/plaque/chancellor.png);
}
</style>