import type { Ref } from "vue";
import { CbrDraggableState, CbrHoverEnterEvent, CbrHoverExitEvent, CbrPinEvent, CbrUnpinnedEvent } from "./cbrDragNDropTypes.ts";
import {CbrDraggableControllerInterface} from '@/cbrDraggableController.js';


export interface CbrDraggableEventsListenerInterface {

    onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void;
    onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void
    onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void;
    onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void;
    onDragStart(draggable: CbrDraggableInterface): void;
    onDragEnd(draggable: CbrDraggableInterface): void;
    onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void;
    onExternalStateChanged(draggable: CbrDraggableInterface, externalState: string, oldValue: any, newValue: any): void;
}


export interface CbrDraggableInterface {
    readonly id: string;
    readonly pinArea: HTMLElement | null;
    readonly hoverArea: HTMLElement | null;
    readonly element: HTMLElement | null;
    readonly controller: CbrDraggableControllerInterface | null;

    unpin() : void;
    pin(pinArea: HTMLElement):void;

    addEventListener(eventListener: CbrDraggableEventsListenerInterface): void;
    removeEventListener(eventListener: CbrDraggableEventsListenerInterface): void;
    forEachListener(callback: (eventListener: CbrDraggableEventsListenerInterface) => void): void;

    updateExternalState(externalState: string, value: any): void;
    getExternalState(externalState: string): any;
}
