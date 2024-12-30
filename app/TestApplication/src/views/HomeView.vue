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
                <div :id="'csv-drop-column-' + index" class="drop-area">
                </div>
            </div>
      </div>

      <div class="chip-area drop-area">
        <CbrDraggable id="test" :controller="draggableController" :event-listener="draggableEventListener">
          <div class="draggable-item">
            test
          </div>
        </CbrDraggable>
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

      <log-area class="log-area">

      </log-area>
    </div>
</template>

<style src="cbr-draggable/dist/style.css">
</style>

<style scoped>

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
  import LogArea from '../components/LogArea.vue';
  import {computed, ref} from 'vue';
  import { CbrDraggable, CbrDraggableController, type CbrDraggableEventsInterface, type CbrDraggableInterface, type CbrDraggableState, type CbrHoverEnterEvent, type CbrHoverExitEvent, type CbrPinEvent, type CbrUnpinnedEvent } from 'cbr-draggable';
  import { useLogStore } from '../stores/logs';

  const logStore = useLogStore();

  // import { CbrDraggableController } from 'cbrdraggable/cbrDraggableController';

  const draggableController = ref(new CbrDraggableController({
    pinAreaSelector: '.drop-area',
    freeAreaSelector: '.chip-area',
  }));

  class DraggableEventListener implements CbrDraggableEventsInterface {
    onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void {
      logStore.add(`onHoverEnter: ${draggable.id}`);
    }
    onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void {
      logStore.add(`onHoverExit: ${draggable.id}`);
    }
    onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void {
      logStore.add(`onPin: ${draggable.id}`);
    }
    onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void {
      logStore.add(`onUnpin: ${draggable.id}`);
    }
    onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void {
      logStore.add(`${draggable.id} -- onStateChanged: ${state.state}`);
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

