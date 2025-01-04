import {CbrDraggableEventsListenerInterface, CbrDraggableInterface} from '@/cbrDraggableInterface.js';
import {
    CbrDraggableState,
    CbrHoverEnterEvent,
    CbrHoverExitEvent,
    CbrPinEvent,
    CbrUnpinnedEvent
} from '@/cbrDragNDropTypes.js';


export class CbrDraggableEventsListener implements CbrDraggableEventsListenerInterface {
    onDragEnd(draggable: CbrDraggableInterface): void {
    }

    onDragStart(draggable: CbrDraggableInterface): void {
    }

    onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void {
    }

    onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void {
    }

    onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void {
    }

    onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void {
    }

    onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void {
    }

    onExternalStateChanged(draggable: CbrDraggableInterface, externalState: string, oldValue: any, newValue: any) {
    }
}
