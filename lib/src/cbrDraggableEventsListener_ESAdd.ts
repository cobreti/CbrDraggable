import {CbrDraggableEventsListener} from '@/cbrDraggableEventsListener.js';
import {draggableESShowAdd} from '@/keys.js';

export class CbrDraggableEventsListener_ESAdd extends CbrDraggableEventsListener {
    onStateChanged(draggable, state) {
        let showAdd = false;

        if (draggable.controller) {
            const controller = draggable.controller;
            const freeAreaElement = controller.freeAreaElement;

            if (state.state === 'dragging' && state.hoverArea && state.hoverArea != freeAreaElement && state.hoverArea != state.pinArea) {
                showAdd = true;
            }
        }

        const existingValue = draggable.getExternalState(draggableESShowAdd) as boolean;

        if (showAdd != existingValue) {
            draggable.updateExternalState(draggableESShowAdd, showAdd);
        }
    }
}
