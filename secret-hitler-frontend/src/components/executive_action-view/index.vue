<template>
    <component v-if="isPresident" :is="'action-' + type" :action="action"/>

    <uikit:simple-page v-else>
        <span slot="header" v-if="type == 'bullet'">The president is assassinating someone</span>
        <span slot="header" v-if="type == 'inspect'">The president is investigating someone</span>
        <span slot="header" v-if="type == 'preview-deck'">The president is looking at the top 3 cards of the deck</span>
        <span slot="header" v-if="type == 'special-election'">The president is choosing the next president</span>
    </uikit:simple-page>
</template>

<script>
import { mapGetters } from 'vuex';

import ActionBullet from './actions/bullet';
import ActionInspect from './actions/inspect';
import ActionPreviewDeck from './actions/preview-deck';
import ActionSpecialElection from './actions/special-election';

export default {
    components: {
        ActionBullet,
        ActionInspect,
        ActionPreviewDeck,
        ActionSpecialElection,
    },

    computed: {
        ...mapGetters({
            game: 'game',
            localPlayer: 'localPlayer',
        }),

        isPresident() {
            return this.action.president == this.localPlayer.id;
        },

        action() {
            return this.game.executiveAction;
        },

        type() {
            return this.action.type.toLowerCase().replace('_', '-');
        }
    },
};
</script>
