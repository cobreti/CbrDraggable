import type { Ref } from "vue";
import { CbrDraggableState, CbrHoverEnterEvent, CbrHoverExitEvent, CbrPinEvent, CbrUnpinnedEvent } from "./cbrDragNDropTypes.ts";


export interface CbrDraggableEventsListenerInterface {

    onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void;
    onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void
    onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void;
    onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void;
    onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void;
}


export interface CbrDraggableInterface {
    readonly id: string;
    readonly showAddIcon : Ref<boolean>;
    readonly showRemoveIcon : Ref<boolean>;

    unpin() : void;
    pin(pinArea: HTMLElement):void;
    addEventListener(eventListener: CbrDraggableEventsListenerInterface);
    removeEventListener(eventListener: CbrDraggableEventsListenerInterface);
    forEachListener(callback: (eventListener: CbrDraggableEventsListenerInterface) => void);
}
