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

    class EventsListener implements CbrDraggableEventsListenerInterface {
        onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void {
            lastEvent.value = `onHoverEnter : ${event.dropArea?.id}`;
        }
        onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void {
            lastEvent.value = `onHoverExit : ${event.dropArea?.id}`;
        }
        onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void {
            lastEvent.value = `onPin : ${event.pinArea.id}`;
        }
        onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void {
            lastEvent.value = `onUnpin : ${event.pinArea?.id}`;
        }
        onStateChanged(draggable: CbrDraggableInterface, newState: CbrDraggableState): void {
            lastStateChange.value = `${newState.state}`;
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
