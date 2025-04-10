/**
  * Draggable component
  *
  * @requires vuejs v3.5.5
  * @slot default
  * @prop {string} dropAreaClass - class name of drop area
  *
  * use special attribut 'cbr-dragndrop-no-pick' to prevent a child element from starting a drag operation
  *
  */

<template>
  <div :class="CbrDraggableClassName" ref="draggableContent">
    <div class="draggable-content" @mousedown="onMouseDown" @touchstart="onTouchStart">
      <slot></slot>
    </div>
    <div class="draggable-content">
      <slot name="decorator"></slot>
    </div>
  </div>
</template>

<style scoped>

  .cbr-draggable-item-root {
    display:  inline-block;

  }
  .draggable-content {
    display: inline-block;
  }
</style>

<script setup lang="ts">

  import {onMounted, onUnmounted, provide, useTemplateRef} from 'vue'
  import {
    CbrDraggableProps,
    CbrDraggableClassName
  } from '../cbrDragNDropTypes.js'
  import {CbrDraggableElementFactory, createDraggableEngine} from '@/cbrDraggableEngine.js';
  import {draggableInjectionKey} from '@/keys.js';
  import {CbrDraggableEventsListener_ESAdd} from '@/eventsListeners/cbrDraggableEventsListener_ESAdd.js';
  import {CbrDraggableEventsListener_ESRemove} from '@/eventsListeners/cbrDraggableEventsListener_ESRemove.js';

  const props = defineProps<CbrDraggableProps>();

  const draggableCore = createDraggableEngine(props, {
    draggableRef: useTemplateRef('draggableContent'),
    hooks: {
      onMounted
    },
    draggableElementFactory: CbrDraggableElementFactory
  });

  draggableCore.addEventListener(new CbrDraggableEventsListener_ESAdd());
  draggableCore.addEventListener(new CbrDraggableEventsListener_ESRemove());

  provide(draggableInjectionKey, draggableCore);


  function onMouseDown(event: MouseEvent) {
    if (draggableCore.onMouseDown(event)) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
  }

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchCancel);
  });

  function onMouseMove(event: MouseEvent) {
    draggableCore.onMouseMove(event);
  }

  function onMouseUp(event: MouseEvent) {
    draggableCore.onMouseUp(event);

    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  function onTouchStart(event: TouchEvent) {
    if (draggableCore.onTouchStart(event)) {
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
      window.addEventListener('touchcancel', onTouchCancel);
    }
  }

  function onTouchMove(event: TouchEvent) {
    draggableCore.onTouchMove(event);
  }

  function onTouchEnd(event: TouchEvent) {
    draggableCore.onTouchEnd(event);

    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchCancel);
  }

  function onTouchCancel(event: TouchEvent) {
    draggableCore.onTouchCancel(event);

    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchCancel);
  }

</script>
