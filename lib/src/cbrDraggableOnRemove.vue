<template>
  <div>
    <div v-show="show">
      <slot>
      </slot>
    </div>
  </div>
</template>

<style scoped>

</style>

<script setup lang="ts">
  import {inject, ref, Ref} from 'vue';
  import {draggableESShowRemove, draggableInjectionKey} from '@/keys.js';
  import {CbrDraggableInterface} from '@/cbrDraggableInterface.js';
  import {CbrDraggableEventsListener} from '@/cbrDraggableEventsListener.js';

  const draggableCore : CbrDraggableInterface = inject(draggableInjectionKey);

  const show: Ref<boolean> = ref(false);

  class listener extends CbrDraggableEventsListener {
    onExternalStateChanged(draggable: CbrDraggableInterface, externalState: string, oldValue: any, newValue: any) {
      if (externalState === draggableESShowRemove) {
        show.value = newValue as boolean;
      }
    }
  }

  draggableCore.addEventListener(new listener());
</script>
