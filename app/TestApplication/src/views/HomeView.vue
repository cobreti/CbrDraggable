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

      <div class="chip-area">
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
    </div>
</template>

<style scoped>

  .drop-area {
    display: block;
    height: 2em;
    border: 1px solid blue;
    margin: 1em;
  }

  .chip-area {
    display: block;
    margin-top: 3em;
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

</style>


<script setup lang="ts">
  import {computed, ref} from 'vue';

  // import { CbrDraggableController } from 'cbrdraggable/cbrDraggableController';

  // const draggableController = ref(new CbrDraggableController({
  //   pinAreaSelector: '.drop-area',
  //   freeAreaSelector: '.chip-area',
  // }));

  // draggableController.value.getDraggable("test");

  const currentRow = computed(() => [
    "column 1",
    "column 2",
    "column 3"
  ]);
  const columnsCount = computed(() => currentRow.value.length);

</script>

