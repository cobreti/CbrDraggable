<template>
    <div class="panel-content">
        <div class="d-flex flex-row justify-start">
            <span><h3>{{ props.id }}</h3></span>
        </div>
        <div class="panel-details">
            <div class="d-flex flex-row justify-start">
                <span>Last event : {{ lastEvent }}</span>
            </div>
            <div class="d-flex flex-row justify-start">
                <span>Last state changed : {{ lastStateChange }}</span>
            </div>
          <div class="d-flex flex-row justify-start">
            <span>show add icon : {{ showAddIcon }}</span>
          </div>
          <div class="d-flex flex-row justify-start">
            <span>pin area : {{ pinArea }}</span>
          </div>
          <div class="d-flex flex-row justify-start">
            <span>hover area : {{ hoverArea }}</span>
          </div>
        </div>
    </div>
</template>

<style scoped>
    .panel-content {
        padding: 1em;
    }

    .panel-details {
        margin-left: 2em;
        margin-top: 0.5em;
    }
</style>

<script setup lang="ts">
    import { type CbrDraggableControllerInterface, type CbrDraggableEventsListenerInterface, type CbrDraggableInterface, type CbrDraggableState, type CbrHoverEnterEvent, type CbrHoverExitEvent, type CbrPinEvent, type CbrUnpinnedEvent } from 'cbr-draggable';
    import { onMounted, ref } from 'vue';
    import { first } from 'rxjs/operators';

    const props = defineProps<{
        id: string,
        controller: CbrDraggableControllerInterface
    }>();

    const lastEvent = ref<string>('');
    const lastStateChange = ref<string>('');
    const showAddIcon = ref<string>('');
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

        globalUpdates(draggable: CbrDraggableInterface): void {

          //
          // update show add icon
          //
          if (draggable.showAddIcon.value ) {
            showAddIcon.value = 'show add icon';
          } else {
            showAddIcon.value = 'hide add icon';
          }

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
            // console.log('draggable', draggable);
        });
    });

</script>
