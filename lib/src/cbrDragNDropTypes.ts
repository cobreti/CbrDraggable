import type {CbrDraggableControllerInterface} from '@/cbrDraggableController.js';
import type {CbrDraggableEventsListenerInterface} from '@/cbrDraggableInterface.js';

export type CbrHoverEnterEvent = {
  element: Element,
  dropArea?: Element,
  dropPrevented: boolean,
  preventDrop: () => void
};

export type CbrHoverExitEvent = {
  element: Element,
  dropArea?: Element
};

export type CbrUnpinnedEvent = {
  element: Element,
  pinArea: Element | undefined
};

export type CbrPinEvent = {
  draggableElement: Element
  pinArea: Element
};

export enum CbrDraggableStateEnum {
  FREE = 'free',
  DRAGGING = 'dragging',
  PINNED = 'pinned'
};

export type CbrDraggableState = {
  state: CbrDraggableStateEnum,
  pinArea?: Element,
  hoverArea?: Element
};

export enum DragnDropEvents {
  HOVER_ENTER = 'cbr-dragdrop:hoverenter',
  HOVER_EXIT = 'cbr-dragdrop:hoverexit',
  // sent after the draggable element has been pinned
  PINNED = 'cbr-dragdrop:pinned',
  // sent after the draggable element has been unpinned
  UNPINNED = 'cbr-dragdrop:unpinned',
  // sent to pin the draggable element
  PIN = 'cbr-dragdrop:pin'
}


export type CbrDraggableProps = {
  id: string,
  controller: CbrDraggableControllerInterface,
  eventListener?: CbrDraggableEventsListenerInterface
};


export type CbrHoverEnterDelegate = (event: CbrHoverEnterEvent) => void;
export type CbrHoverExitDelegate = (event: CbrHoverExitEvent) => void;