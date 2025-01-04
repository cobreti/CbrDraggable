<template>
    <div class="panel-content">
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>
            <span>{{ props.id}}</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
              <div class="panel-details">
                <div class="d-flex flex-row justify-start">
                  <span>Last event : {{ lastEvent }}</span>
                </div>
                <div class="d-flex flex-row justify-start">
                  <span>Last state changed : {{ lastStateChange }}</span>
                </div>
                <div class="d-flex flex-row justify-start">
                  <span>pin area : {{ pinArea }}</span>
                </div>
                <div class="d-flex flex-row justify-start">
                  <span>hover area : {{ hoverArea }}</span>
                </div>
              </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
</template>

<style scoped>
    .panel-content {
    }

    .panel-details {
        margin-left: 2em;
    }
</style>

<script setup lang="ts">
    import { defineProps } from 'vue';
    import { type CbrDraggableControllerInterface, type CbrDraggableEventsListenerInterface, type CbrDraggableInterface, type CbrDraggableState, type CbrHoverEnterEvent, type CbrHoverExitEvent, type CbrPinEvent, type CbrUnpinnedEvent } from 'cbr-draggable';
    import { onMounted, ref } from 'vue';
    import { first } from 'rxjs/operators';

    const props = defineProps<{
        id: string,
        controller: CbrDraggableControllerInterface
    }>();

    const lastEvent = ref<string>('');
    const lastStateChange = ref<string>('');
    const pinArea = ref<string>('');
    const hoverArea = ref<string>('');

    class EventsListener implements CbrDraggableEventsListenerInterface {
        onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void {
            lastEvent.value = `onHoverEnter : ${event.dropArea?.id}`;
            this.globalUpdates(draggable);
        }
        onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void {
            lastEvent.value = `onHoverExit : ${event.dropArea?.id}`;
            this.globalUpdates(draggable);
        }
        onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void {
            lastEvent.value = `onPin : ${event.pinArea.id}`;
            this.globalUpdates(draggable);
        }
        onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void {
            lastEvent.value = `onUnpin : ${event.pinArea?.id}`;
            this.globalUpdates(draggable);
        }
        onStateChanged(draggable: CbrDraggableInterface, newState: CbrDraggableState): void {
            lastStateChange.value = `${newState.state}`;
            this.globalUpdates(draggable);
        }
        onDragStart(draggable: CbrDraggableInterface): void {
        }
        onDragEnd(draggable: CbrDraggableInterface): void {
        }
        onExternalStateChanged(draggable: CbrDraggableInterface, externalState: string, oldValue: any, newValue: any) {
        }

      globalUpdates(draggable: CbrDraggableInterface): void {

          //
          // update pin area
          //
          if (draggable.pinArea) {
            pinArea.value = draggable.pinArea.id;
          } else {
            pinArea.value = 'no pin area';
          }

          //
          // update hover area
          //
          if (draggable.hoverArea) {
            hoverArea.value = draggable.hoverArea.id;
          } else {
            hoverArea.value = 'no hover area';
          }
        }
    }

    const listener = new EventsListener();

    onMounted(() => {
        props.controller.getDraggableObserver(props.id)
        .pipe(first())
        .subscribe(draggable => {
            draggable?.addEventListener(listener);
        });
    });

</script>
