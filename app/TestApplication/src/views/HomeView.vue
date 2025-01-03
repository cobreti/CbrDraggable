<template>
    <div>
        <div class="selector-title">Drop areas</div>
        <div class="d-flex flex-row justify-start align-content-space-evenly selector">
            <div v-for="(n, index) in columnsCount"
                :key="index"
                :id="'csv-column-' + index"
                class="column-cell"
            >
              <v-card elevated>
                <v-card-title>{{ currentRow[index] }}</v-card-title>
                <v-card-subtitle>drop-column-{{index+1}}</v-card-subtitle>
                <v-card-text>
                  <div :id="'drop-column-' + (index + 1)" class="drop-area">
                  </div>
                </v-card-text>
              </v-card>
            </div>
      </div>

      <div class="draggable-title">Draggables (available zone)</div>
      <v-card id="chip-area" class="chip-area drop-area">
        <span v-for="(item, index) in draggableItems" :key="index">
          <CbrDraggable :id="item"
            :controller="draggableController"
            :event-listener="draggableEventListener">
            <div class="draggable-item">
              {{ item }}
            </div>
          </CbrDraggable>
        </span>
      </v-card>
      <div class="draggable-info-title">Draggables live informations</div>
      <div class="observer-panel" v-for="(item, index) in draggableItems" :key="index">
        <draggable-observer-panel class="draggable-observer-panel" :id="item" :controller="draggableController">

        </draggable-observer-panel>
      </div>
    </div>
</template>

<style src="cbr-draggable/dist/style.css">
</style>

<style scoped>

  .draggable-title {
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  .draggable-info-title {
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  .observer-panel {
    display: inline-block;
    width: calc(100% - 2em);
    margin-left: 1em;
  }

  .draggable-observer-panel {
    margin-left: 1em;
  }

  .draggable-item {
    display: inline-block;
    position: relative;
    background-color: lightgray;
    padding: 0.25em;
    border: 1px solid blue;
    border-radius: 0.5em;
    min-width: 3em;
    text-align: center;
    cursor: pointer;
  }

  .drop-area {
    display: block;
    min-height: 3em;
    padding: 0.25em;
    margin: 0em 1em 1em;
    box-shadow: #7f7f7f 0.05em 0.05em 0.05em 0.1em;
  }

  .chip-area {
    display: block;
    padding: 0.25em;
    min-height: 4em;
  }

  .selector-title {
    font-weight: bold;
    margin-bottom: 0.5em;
  }

  .selector {
    display: block;
    margin-bottom: 1em;
    margin-left: 1em;
    margin-right: 1em;
  }

  .column-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: default;
    width: 100%;
    min-width: 1em;
    min-height: 2em;
    padding-left: 0.5em;
    padding-right: 0.5em;

    .column-cell-text {
      display: block;
      text-align: center;
      font-size: small;
    }
  }

  .log-area {
    display: block;
    margin-left: 1em;
    width: 80%;
    height: 10em;
  }

</style>


<script setup lang="ts">
  import DraggableObserverPanel from '../components/DraggableObserverPanel.vue';
  import {computed, ref} from 'vue';
  import { CbrDraggable, CbrDraggableController, type CbrDraggableEventsListenerInterface, type CbrDraggableInterface, type CbrDraggableState, type CbrHoverEnterEvent, type CbrHoverExitEvent, type CbrPinEvent, type CbrUnpinnedEvent } from 'cbr-draggable';

  const draggableController = ref(new CbrDraggableController({
    pinAreaSelector: '.drop-area',
    freeAreaSelector: '.chip-area',
  }));

  const draggableItems = ref([
    "item-1",
    "item-2",
    "item-3",
    "item-4",
    "item-5",
    "item-6",
    "item-7",
    "item-8"
  ]);

  class DraggableEventListener implements CbrDraggableEventsListenerInterface {
    onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void {
      console.log(`onHoverEnter: ${draggable.id}`);
    }
    onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void {
      console.log(`onHoverExit: ${draggable.id}`);
    }
    onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void {
      console.log(`onPin: ${draggable.id}`);
    }
    onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void {
      console.log(`onUnpin: ${draggable.id}`);
    }
    onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void {
      console.log(`${draggable.id} -- onStateChanged: ${state.state}`);
    }
  }

  const draggableEventListener = ref(new DraggableEventListener());

  const currentRow = computed(() => [
    "column 1",
    "column 2",
    "column 3"
  ]);
  const columnsCount = computed(() => currentRow.value.length);

</script>

