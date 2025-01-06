import {CbrDraggableState, CbrDraggableStateEnum} from '@/cbrDragNDropTypes.js';
import {CbrDraggableEventsListener} from '@/eventsListeners/cbrDraggableEventsListener.js';
import {draggableESShowRemove} from '@/keys.js';
import {CbrDraggableInterface} from '@/cbrDraggableInterface.js';

export class CbrDraggableEventsListener_ESRemove extends CbrDraggableEventsListener {
    onStateChanged(draggable : CbrDraggableInterface, state : CbrDraggableState) {
        let showRemove = false;

        if (draggable.controller) {
            const controller = draggable.controller;
            const freeAreaElm = controller.freeAreaElement;

            if (state.state == CbrDraggableStateEnum.PINNED && state.pinArea ) {
                showRemove = true;
            }
        }

        const existingValue = draggable.getExternalState(draggableESShowRemove) as boolean;
        if (existingValue != showRemove) {
            draggable.updateExternalState(draggableESShowRemove, showRemove);
        }
    }
}
