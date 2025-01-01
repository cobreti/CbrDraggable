<template>
    <div>
        <div class="d-flex flex-row justify-start align-content-space-evenly selector">
            <div v-for="(n, index) in columnsCount"
                :key="index"
                :id="'csv-column-' + index"
                class="column-cell"
            >
                <div class="column-cell-text">
                    {{ currentRow[index] }}
                </div>
                <div>
                </div>
                <div :id="'drop-column-' + (index + 1)" class="drop-area">
                </div>
            </div>
      </div>

      <div id="chip-area" class="chip-area drop-area">
        <span v-for="(item, index) in draggableItems" :key="index">
          <CbrDraggable :id="item"
            :controller="draggableController" 
            :event-listener="draggableEventListener">
            <div class="draggable-item">
              {{ item }}
            </div>
          </CbrDraggable>
        </span>
        <!-- <CbrDraggable id="test2" class="draggable-item" :controller="draggableController">
          <BdgDraggableItem :draggableObserver="draggableController.getDraggableObserver('test2')">
            <span>test 2</span>
          </BdgDraggableItem>

        </CbrDraggable>
        <CbrDraggable id="test" class="draggable-item" :controller="draggableController">
          <BdgDraggableItem :draggableObserver="draggableController.getDraggableObserver('test')">
            <span>test</span>
          </BdgDraggableItem>
        </CbrDraggable>

        <CbrDraggable id="test 3" class="draggable-item" :controller="draggableController">
            <span>test 3</span>
        </CbrDraggable> -->
      </div>

      <div class="observer-panel" v-for="(item, index) in draggableItems" :key="index">
        <draggable-observer-panel class="draggable-observer-panel" :id="item" :controller="draggableController">

        </draggable-observer-panel>
      </div>
    </div>
</template>

<style src="cbr-draggable/dist/style.css">
</style>

<style scoped>

  .observer-panel {
    display: inline-block;
    width: calc(50% - 2em);
    border: 1px solid black;
    margin-left: 1em;
    margin-bottom: 1em;
  }

  .draggable-observer-panel {
    /* width: 50%; */
    margin-left: 1em;
  }


  .draggable-item {
    display: inline-block;
    position: relative;
    background-color: lightgray;
    padding: 0.25em;
    /* margin: 0.5em; */
    border: 1px solid blue;
    border-radius: 0.5em;
    min-width: 3em;
    text-align: center;
    cursor: pointer;
  }

  .drop-area {
    display: block;
    height: 3em;
    padding: 0.25em;
    border: 1px solid blue;
    margin: 1em;
  }

  .chip-area {
    display: block;
    margin-top: 3em;
    padding: 0.25em;
    border: 1px solid blue;
    min-height: 4em;
  }

  .selector {
    border: 1px dotted black;
    width: 100%;
    height: 100%;
    display: block;
  }

  .column-cell {
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: default;
    border: 1px solid black;
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
    border: 1px solid black;
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

