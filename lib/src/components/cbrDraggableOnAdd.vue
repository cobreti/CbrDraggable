<template>
  <div v-show="show" @click="onClick">
    <slot>
    </slot>
  </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
  import {inject, ref, Ref, defineEmits} from 'vue';
  import {draggableESShowAdd, draggableInjectionKey} from '@/keys.js';
  import {CbrDraggableInterface} from '@/cbrDraggableInterface.js';
  import {CbrDraggableEventsListener} from '@/eventsListeners/cbrDraggableEventsListener.js';

  const emit = defineEmits(['click']);

  const draggableCore : CbrDraggableInterface = inject(draggableInjectionKey);

  const show: Ref<boolean> = ref(false);

  class listener extends CbrDraggableEventsListener {
    onExternalStateChanged(draggable: CbrDraggableInterface, externalState: string, oldValue: any, newValue: any) {
      if (externalState === draggableESShowAdd) {
        show.value = newValue as boolean;
      }
    }
  }

  draggableCore.addEventListener(new listener());

  function onClick() {
    emit('click', draggableCore);
  }
</script>
