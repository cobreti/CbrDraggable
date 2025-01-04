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
  pinArea?: HTMLElement,
  hoverArea?: HTMLElement
};


export type CbrDraggableProps = {
  id: string,
  controller: CbrDraggableControllerInterface,
  eventListener?: CbrDraggableEventsListenerInterface
};

