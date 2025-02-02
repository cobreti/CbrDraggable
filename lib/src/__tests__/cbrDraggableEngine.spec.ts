import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  CbrDraggableProps,
  CbrDraggableState,
  CbrDraggableStateEnum,
  CbrHoverEnterEvent,
  CbrHoverExitEvent,
  CbrPinEvent,
  CbrUnpinnedEvent
} from '@/cbrDragNDropTypes.ts';
import { JSDOM } from 'jsdom';
import { Ref, ref } from 'vue';
import { CbrDraggableEngine, DraggableEngineOptions } from '@/cbrDraggableEngine.ts';
import { CbrDraggableController, CbrDraggableControllerOptions } from '@/cbrDraggableController.ts';
import { CbrDraggableElement, CbrDraggableElementOptions } from '@/cbrDraggableElement.js';
import { CbrDraggableEventsListenerInterface, type CbrDraggableInterface } from '@/cbrDraggableInterface.js';

declare namespace global {
  let document: Document;
}

describe('cbrDraggableEngine', () => {

  let jsdom: JSDOM = new JSDOM(`
    <html>
      <body>
        <div id="container">
            <div id="draggable-item"></div>
            <div class="pin-area"></div>
            <div class="free-area"></div>
            <div class="hover-area"></div>
        </div>
      </body>
    </html>`);


  const draggableId = 'drag1';
  const draggableRef: Ref<HTMLElement> = ref<HTMLElement>(jsdom.window.document.querySelector('#draggable-item'));
  const controllerOptions: CbrDraggableControllerOptions = {
    pinAreaSelector: '.pin-area',
    freeAreaSelector: '.free-area'
  }
  let controller: CbrDraggableController;

  function onMounted(callback: () => void): void {
    callback();
  }

  const draggableElementMock = {
    get htmlElement(): HTMLElement { return draggableRef.value; },
    get valid(): boolean { return true; },
    restoreSavedProps(): void { },
    addAsChildToElement(element: HTMLElement): void { },
    startDragMode(clientX: number, clientY: number): void { },
    updateDragTopLeftPosition(clientX: number, clientY: number): void { }
  } as CbrDraggableElement;

  const options: DraggableEngineOptions = {
    draggableRef,
    hooks: {
      onMounted
    },
    draggableElementFactory: (options: CbrDraggableElementOptions) => { return draggableElementMock; }
  };

  let props: CbrDraggableProps;

  beforeEach(() => {
    global.document = jsdom.window.document;
    controller = new CbrDraggableController(controllerOptions);
    props = {
      id: draggableId,
      controller,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {

    test('no listeners', () => {

      const registerDraggableSpy = vi.spyOn(controller, 'registerDraggable').mockImplementation(() => { });
      const mountedSpy = vi.spyOn(options.hooks, 'onMounted');

      const draggableEngine = new CbrDraggableEngine(props, options);

      expect(draggableEngine.element_).not.toBeNull();
      expect(registerDraggableSpy).toHaveBeenCalledTimes(1);
      expect(mountedSpy).toHaveBeenCalledTimes(1);
      expect(draggableEngine.freeArea_.value).toBe(jsdom.window.document.querySelector('.free-area'));
      expect(draggableEngine.state_.value).toEqual({ state: CbrDraggableStateEnum.FREE });
      expect(draggableEngine.id).toBe(draggableId);
      expect(draggableEngine.pinArea).toBeUndefined();
      expect(draggableEngine.hoverArea).toBeUndefined();
      expect(draggableEngine.controller).toBe(controller);
      expect(draggableEngine.element).toBe(draggableElementMock.htmlElement);
    });

    test('listener presents', () => {

      const listener = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void { }
      } as CbrDraggableEventsListenerInterface;

      const registerDraggableSpy = vi.spyOn(controller, 'registerDraggable').mockImplementation(() => { });
      const mountedSpy = vi.spyOn(options.hooks, 'onMounted');
      const localProps = { ...props, eventListener: listener };
      const listenerSpy = vi.spyOn(listener, 'onStateChanged');

      const draggableEngine = new CbrDraggableEngine(localProps, options);

      expect(draggableEngine.element_).not.toBeNull();
      expect(registerDraggableSpy).toHaveBeenCalledTimes(1);
      expect(mountedSpy).toHaveBeenCalledTimes(1);
      expect(draggableEngine.freeArea_.value).toBe(jsdom.window.document.querySelector('.free-area'));
      expect(draggableEngine.state_.value).toEqual({ state: CbrDraggableStateEnum.FREE });
      expect(draggableEngine.id).toBe(draggableId);
      expect(draggableEngine.pinArea).toBeUndefined();
      expect(draggableEngine.hoverArea).toBeUndefined();
      expect(draggableEngine.controller).toBe(controller);
      expect(draggableEngine.element).toBe(draggableElementMock.htmlElement);
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

  });

  describe('unpin', () => {

    test('invalid element', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const elementValidSpy = vi.spyOn(draggableElementMock, 'valid', 'get').mockReturnValue(false);
      const addToFreeAreaSpy = vi.spyOn(draggableEngine, 'addToFreeArea').mockImplementation(() => { });
      const setStateSpy = vi.spyOn(draggableEngine, 'setState').mockImplementation(() => { });

      draggableEngine.unpin();

      expect(addToFreeAreaSpy).not.toHaveBeenCalled();
      expect(setStateSpy).not.toHaveBeenCalled();
    });

    test('no pin area', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      draggableEngine.state.value = {
        state: CbrDraggableStateEnum.DRAGGING
      };

      const addToFreeAreaSpy = vi.spyOn(draggableEngine, 'addToFreeArea')
        .mockImplementation(() => { });
      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
        .mockImplementation(() => { });
      const restoreSavedPropsSpy = vi.spyOn(draggableElementMock, 'restoreSavedProps')
        .mockImplementation(() => { });
      const dispatchUnpinnedEventSpy = vi.spyOn(draggableEngine, 'dispatchUnpinnedEvent');

      draggableEngine.unpin();

      expect(addToFreeAreaSpy).toHaveBeenCalled();
      expect(dispatchUnpinnedEventSpy).not.toHaveBeenCalled();
      expect(setStateSpy).toHaveBeenCalledWith({
        state: CbrDraggableStateEnum.FREE
      });
      expect(restoreSavedPropsSpy).toHaveBeenCalled();
    });

    test('pin area', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const unpinEvent = {
        element: draggableRef.value,
        pinArea: jsdom.window.document.querySelector('.pin-area')
      };

      let receivedEvent: CbrUnpinnedEvent | undefined;

      draggableEngine.state.value = {
        state: CbrDraggableStateEnum.DRAGGING
      };

      draggableEngine.state.value.pinArea = jsdom.window.document.querySelector('.pin-area');

      const addToFreeAreaSpy = vi.spyOn(draggableEngine, 'addToFreeArea')
        .mockImplementation(() => { });
      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
        .mockImplementation(() => { });
      const restoreSavedPropsSpy = vi.spyOn(draggableElementMock, 'restoreSavedProps')
        .mockImplementation(() => { });
      const dispatchUnpinnedEventSpy = vi.spyOn(draggableEngine, 'dispatchUnpinnedEvent')
          .mockImplementation((event: CbrUnpinnedEvent) => {receivedEvent = event;});

      draggableEngine.unpin();

      expect(addToFreeAreaSpy).toHaveBeenCalled();
      expect(setStateSpy).toHaveBeenCalledWith({
        state: CbrDraggableStateEnum.FREE
      })
      expect(restoreSavedPropsSpy).toHaveBeenCalled();
      expect(dispatchUnpinnedEventSpy).toHaveBeenCalled();
      expect(receivedEvent).toEqual(unpinEvent);
    });
  });

  describe('pin', () => {

    test('invalid element', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const pinElement = jsdom.window.document.querySelector('.pin-area') as HTMLElement;

      const elementValidSpy = vi.spyOn(draggableElementMock, 'valid', 'get')
        .mockReturnValue(false);
      const forEachListenerSpy = vi.spyOn(draggableEngine, 'forEachListener')
        .mockImplementation(() => { });

      draggableEngine.pin(pinElement);

      expect(elementValidSpy).toHaveBeenCalled();
      expect(forEachListenerSpy).not.toHaveBeenCalled();
    });

    test('hover area same as pin area', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const pinElement = jsdom.window.document.querySelector('.pin-area') as HTMLElement;

      const pinEvent = {
        draggableElement: draggableRef.value,
        pinArea: pinElement
      } as CbrPinEvent;

      let pinEventReceived: CbrPinEvent | undefined;
      let parentElementReceived: HTMLElement | undefined;

      const dispatchPinEventSpy = vi.spyOn(draggableEngine, 'dispatchPinEvent')
        .mockImplementation((event: CbrPinEvent) => {
          pinEventReceived = event;
        });
      const updateStateAfterPinSpy = vi.spyOn(draggableEngine, 'updateStateAfterPin')
        .mockImplementation(() => { });
      const addAsChildToElementSpy = vi.spyOn(draggableEngine.element_, 'addAsChildToElement')
        .mockImplementation((element: HTMLElement) => {
          parentElementReceived = element;
        });

      draggableEngine.pin(pinElement);

      expect(dispatchPinEventSpy).toHaveBeenCalled();
      expect(pinEventReceived).toEqual(pinEvent);
      expect(updateStateAfterPinSpy).toHaveBeenCalled();
      expect(addAsChildToElementSpy).toHaveBeenCalled();
      expect(parentElementReceived).toBe(pinElement);
    });

    test('hover area different as pin area', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const pinArea = jsdom.window.document.querySelector('.pin-area') as HTMLElement;
      const hoverElement = jsdom.window.document.querySelector('.hover-area') as HTMLElement;

      const pinEvent = {
        draggableElement: draggableRef.value,
        pinArea: pinArea
      } as CbrPinEvent;

      const unpinnedEvent = {
        element: draggableRef.value,
        pinArea: pinArea
      } as CbrUnpinnedEvent;

      let pinEventReceived: CbrPinEvent | undefined;
      let unpinnedEventReceived: CbrUnpinnedEvent | undefined;
      let parentElementReceived: HTMLElement | undefined;

      const dispatchPinEventSpy = vi.spyOn(draggableEngine, 'dispatchPinEvent')
        .mockImplementation((event: CbrPinEvent) => {
          pinEventReceived = event;
        });
      const dispatchUnpinnedEventSpy = vi.spyOn(draggableEngine, 'dispatchUnpinnedEvent')
          .mockImplementation((event : CbrUnpinnedEvent) => {
            unpinnedEventReceived = event;
          });
      const updateStateAfterPinSpy = vi.spyOn(draggableEngine, 'updateStateAfterPin')
        .mockImplementation(() => { });
      const addAsChildToElementSpy = vi.spyOn(draggableEngine.element_, 'addAsChildToElement')
        .mockImplementation((element: HTMLElement) => {
          parentElementReceived = element;
        });

      draggableEngine.state.value.hoverArea = hoverElement;
      draggableEngine.state.value.pinArea = pinArea;
      draggableEngine.pin(pinArea);

      expect(dispatchPinEventSpy).toHaveBeenCalled();
      expect(pinEventReceived).toEqual(pinEvent);
      expect(updateStateAfterPinSpy).toHaveBeenCalled();
      expect(addAsChildToElementSpy).toHaveBeenCalled();
      expect(parentElementReceived).toBe(pinArea);
      expect(dispatchUnpinnedEventSpy).toHaveBeenCalled();
      expect(unpinnedEventReceived).toEqual(unpinnedEvent);
    });
  });

  describe('setState', () => {

    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const eventListener = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void {
          stateReceived = state;
         }
      } as CbrDraggableEventsListenerInterface;

      let stateReceived : CbrDraggableState | undefined;

      const newState = {
        state: CbrDraggableStateEnum.DRAGGING,
        pinArea: jsdom.window.document.querySelector('.pin-area'),
        hoverArea: jsdom.window.document.querySelector('.free-area')
      } as CbrDraggableState;

      const forEachListenerSpy = vi.spyOn(draggableEngine, 'forEachListener');

      draggableEngine.addEventListener(eventListener);
      draggableEngine.setState(newState);

      expect(stateReceived).toEqual(newState);
      expect(draggableEngine.state.value).toEqual(newState);
      expect(forEachListenerSpy).toHaveBeenCalled();
    });
  });

  describe('updateStateAfterPin', () => {

    test('pin area is free area', () => {
      const draggable = new CbrDraggableEngine(props, options);
      draggable.state.value.state = CbrDraggableStateEnum.DRAGGING;

      const pinArea = jsdom.window.document.querySelector('.free-area') as HTMLElement;

      let newStateReceived : CbrDraggableState | undefined;

      const setStateSpy = vi.spyOn(draggable, 'setState').mockImplementation(() => { })
          .mockImplementation((newState: CbrDraggableState) => { newStateReceived = newState; });

      draggable.updateStateAfterPin(pinArea);

      expect(setStateSpy).toHaveBeenCalled();
      expect(newStateReceived).not.toBeUndefined();
      expect(newStateReceived?.state).toBe(CbrDraggableStateEnum.FREE);
    });

    test('pin area different free area', () => {
      const draggable = new CbrDraggableEngine(props, options);
      draggable.state.value.state = CbrDraggableStateEnum.DRAGGING;

      const pinArea = jsdom.window.document.querySelector('.pin-area') as HTMLElement;

      let newStateReceived : CbrDraggableState | undefined;

      const setStateSpy = vi.spyOn(draggable, 'setState').mockImplementation(() => { })
          .mockImplementation((newState: CbrDraggableState) => { newStateReceived = newState; });

      draggable.updateStateAfterPin(pinArea);

      expect(setStateSpy).toHaveBeenCalled();
      expect(newStateReceived).not.toBeUndefined();
      expect(newStateReceived?.state).toBe(CbrDraggableStateEnum.PINNED);
    });

  });

  describe('updateExternalState', () => {

    test('success path', () => {
      const externalState = 'external state';
      const value = 'new value';

      const receivedValues = {
        oldValue: undefined,
        newValue: undefined,
        externalState: undefined
      };

      const draggable = new CbrDraggableEngine(props, options);

      const dispatchExternalStateChangedSpy = vi.spyOn(draggable, 'dispatchExternalStateChanged')
          .mockImplementation((externalState: string, oldValue: any, newValue: any) => {
            receivedValues.externalState = externalState;
            receivedValues.oldValue = oldValue;
            receivedValues.newValue = newValue;
          });

      const stateOldValue = draggable.externalStates_.get(externalState);

      draggable.updateExternalState(externalState, value);

      const stateNewValue = draggable.externalStates_.get(externalState);

      expect(dispatchExternalStateChangedSpy).toHaveBeenCalled();
      expect(receivedValues.externalState).toBe(externalState);
      expect(receivedValues.oldValue).toBeUndefined();
      expect(receivedValues.newValue).toBe(value);
      expect(stateOldValue).toBeUndefined();
      expect(stateNewValue).toBe(value);
    });
  });

  describe('getExternalState', () => {

      test('success path', () => {
        const externalState = 'external state';
        const value = 'new value';

        const draggable = new CbrDraggableEngine(props, options);

        draggable.externalStates_.set(externalState, value);

        const receivedValue = draggable.getExternalState(externalState);

        expect(receivedValue).toBe(value);
      });

      test('no state value', () => {
        const externalState = 'external state';

        const draggable = new CbrDraggableEngine(props, options);

        const receivedValue = draggable.getExternalState(externalState);

        expect(receivedValue).toBeUndefined();
      })
  });

  describe('addEventListener', () => {

    test('success path', () => {
      const draggable = new CbrDraggableEngine(props, options);

      const listener = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void { }
      } as CbrDraggableEventsListenerInterface;

      expect(draggable.eventListeners_.size).toBe(0);

      draggable.addEventListener(listener);

      expect(draggable.eventListeners_.size).toBe(1);
      expect(Array.from(draggable.eventListeners_)).toEqual([listener]);
    });
  });

  describe('removeEventListener', () => {

    test('single listener', () => {
      const draggable = new CbrDraggableEngine(props, options);

      const listener = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void { }
      } as CbrDraggableEventsListenerInterface;

      draggable.addEventListener(listener);

      expect(draggable.eventListeners_.size).toBe(1);

      draggable.removeEventListener(listener);

      expect(draggable.eventListeners_.size).toBe(0);
    });

    test('multiple listeners', () => {
      const draggable = new CbrDraggableEngine(props, options);

      const listener1 = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void { }
      } as CbrDraggableEventsListenerInterface;

      const listener2 = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void { }
      } as CbrDraggableEventsListenerInterface;

      draggable.addEventListener(listener1);
      draggable.addEventListener(listener2);

      expect(draggable.eventListeners_.size).toBe(2);

      draggable.removeEventListener(listener1);

      expect(draggable.eventListeners_.size).toBe(1);
      expect(Array.from(draggable.eventListeners_)).toEqual([listener2]);
    });
  });

  describe('forEachListener', () => {
    test('multiple listeners get all called', () => {
      const draggable = new CbrDraggableEngine(props, options);

      const listener1 = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void { }
      } as CbrDraggableEventsListenerInterface;

      const listener2 = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void { }
      } as CbrDraggableEventsListenerInterface;

      const listener1Spy = vi.spyOn(listener1, 'onStateChanged');
      const listener2Spy = vi.spyOn(listener2, 'onStateChanged');

      draggable.addEventListener(listener1);
      draggable.addEventListener(listener2);

      draggable.forEachListener((listener: CbrDraggableEventsListenerInterface) => {
        listener.onStateChanged(draggable, draggable.state.value);
      });

      expect(listener1Spy).toHaveBeenCalled();
      expect(listener2Spy).toHaveBeenCalled();
    });
  });

  describe('getDropAreaFromPoint', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const dropAreaElement = jsdom.window.document.querySelector('.hover-area') as HTMLElement;
      const controllerGetDropAreaFromPointSpy = vi.spyOn(controller, 'getDropAreaFromPoint')
          .mockImplementation((x: number, y: number) => { return dropAreaElement; });

      const area = draggableEngine.getDropAreaFromPoint(0, 0);

      expect(area).toBe(dropAreaElement);
      expect(controllerGetDropAreaFromPointSpy).toHaveBeenCalled();
    });
  });

  describe('dispatchPinEvent', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const pinEvent = {
        draggableElement: draggableRef.value,
        pinArea: jsdom.window.document.querySelector('.pin-area')
      } as CbrPinEvent;

      const listener = {
        onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void { }
      } as CbrDraggableEventsListenerInterface;

      let receivedEvent : CbrPinEvent | undefined;
      let receivedDraggable : CbrDraggableInterface | undefined;

      const listenerSpy = vi.spyOn(listener, 'onPin')
        .mockImplementation((draggable: CbrDraggableInterface, event: CbrPinEvent) => {
          receivedDraggable = draggable;
          receivedEvent = event;
        });

      draggableEngine.addEventListener(listener);
      draggableEngine.dispatchPinEvent(pinEvent);

      expect(listenerSpy).toHaveBeenCalled();
      expect(receivedEvent).not.toBeUndefined();
      expect(receivedEvent).toEqual(pinEvent);
      expect(receivedDraggable).toBe(draggableEngine);
    });
  });

  describe('dispatchUnpinnedEvent', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const unpinnedEvent = {
        element: draggableRef.value,
        pinArea: jsdom.window.document.querySelector('.pin-area')
      } as CbrUnpinnedEvent;

      const listener = {
        onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void { }
      } as CbrDraggableEventsListenerInterface;

      let receivedEvent : CbrUnpinnedEvent | undefined;
      let receivedDraggable : CbrDraggableInterface | undefined;

      const listenerSpy = vi.spyOn(listener, 'onUnpin')
        .mockImplementation((draggable: CbrDraggableInterface, event: CbrUnpinnedEvent) => {
          receivedDraggable = draggable;
          receivedEvent = event;
        });

      draggableEngine.addEventListener(listener);
      draggableEngine.dispatchUnpinnedEvent(unpinnedEvent);

      expect(listenerSpy).toHaveBeenCalled();
      expect(receivedEvent).not.toBeUndefined();
      expect(receivedEvent).toEqual(unpinnedEvent);
      expect(receivedDraggable).toBe(draggableEngine);
    });
  });

  describe('dispatchExternalStateChanged', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const externalState = 'external state';
      const oldValue = 'old value';
      const newValue = 'new value';

      const listener = {
        onExternalStateChanged(draggable: CbrDraggableInterface, externalState: string, oldValue: any, newValue: any): void { }
      } as CbrDraggableEventsListenerInterface;

      let receivedExternalState : string | undefined;
      let receivedOldValue : any | undefined;
      let receivedNewValue : any | undefined;
      let receivedDraggable : CbrDraggableInterface | undefined;

      const listenerSpy = vi.spyOn(listener, 'onExternalStateChanged')
        .mockImplementation((draggable: CbrDraggableInterface, externalState: string, oldValue: any, newValue: any) => {
          receivedDraggable = draggable;
          receivedExternalState = externalState;
          receivedOldValue = oldValue;
          receivedNewValue = newValue;
        });

      draggableEngine.addEventListener(listener);
      draggableEngine.dispatchExternalStateChanged(externalState, oldValue, newValue);

      expect(listenerSpy).toHaveBeenCalled();
      expect(receivedExternalState).toBe(externalState);
      expect(receivedOldValue).toBe(oldValue);
      expect(receivedNewValue).toBe(newValue);
      expect(receivedDraggable).toBe(draggableEngine);
    });
  });

  describe('dispatchDragStartEvent', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const listener = {
        onDragStart(draggable: CbrDraggableInterface): void {
        }
      } as CbrDraggableEventsListenerInterface;

      let receivedDraggable: CbrDraggableInterface | undefined;

      const listenerSpy = vi.spyOn(listener, 'onDragStart')
          .mockImplementation((draggable: CbrDraggableInterface) => {
            receivedDraggable = draggable;
          });

      draggableEngine.addEventListener(listener);

      draggableEngine.dispatchDragStartEvent();

      expect(listenerSpy).toHaveBeenCalled();
      expect(receivedDraggable).toBe(draggableEngine);
    })
  });

  describe('dispatchHoverEnterEvent', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const listener = {
        onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void {
        }
      } as CbrDraggableEventsListenerInterface;

      const hoverArea = jsdom.window.document.querySelector('.hover-area') as HTMLElement;

      const event: CbrHoverEnterEvent = {
        element: draggableEngine.element_.htmlElement,
        dropArea: hoverArea,
        dropPrevented: false,
        preventDrop: () => {}
      };
      
      let receivedDraggable: CbrDraggableInterface | undefined;
      let receivedHoverArea: HTMLElement | undefined;

      const listenerSpy = vi.spyOn(listener, 'onHoverEnter')
          .mockImplementation((draggable: CbrDraggableInterface, event: CbrHoverEnterEvent) => {
            receivedDraggable = draggable;
            receivedHoverArea = event.dropArea as HTMLElement;
          });

      draggableEngine.addEventListener(listener);

      draggableEngine.dispatchHoverEnterEvent(event);

      expect(listenerSpy).toHaveBeenCalled();
      expect(receivedDraggable).toBe(draggableEngine);
      expect(receivedHoverArea).toBe(hoverArea);
    });
  });

  describe('dispatchHoverExitEvent', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const listener = {
        onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void {
        }
      } as CbrDraggableEventsListenerInterface;

      const hoverArea = jsdom.window.document.querySelector('.hover-area') as HTMLElement;

      const event: CbrHoverExitEvent = {
        element: draggableEngine.element_.htmlElement,
        dropArea: hoverArea
      };

      let receivedDraggable: CbrDraggableInterface | undefined;
      let receivedHoverExitEvent: CbrHoverExitEvent | undefined;

      const listenerSpy = vi.spyOn(listener, 'onHoverExit')
          .mockImplementation((draggable: CbrDraggableInterface, event: CbrHoverExitEvent) => {
            receivedDraggable = draggable;
            receivedHoverExitEvent = event;
          });

      draggableEngine.addEventListener(listener);

      draggableEngine.dispatchHoverExitEvent(event);

      expect(listenerSpy).toHaveBeenCalled();
      expect(receivedDraggable).toBe(draggableEngine);
      expect(receivedHoverExitEvent).not.toBeUndefined();
      expect(receivedHoverExitEvent.dropArea).toBe(hoverArea);
    });
  });

  describe('dispatchDragEndEvent', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      // Create a mock listener with an `onDragEnd` method
      const listener = {
        onDragEnd(draggable: CbrDraggableInterface): void {}
      } as CbrDraggableEventsListenerInterface;

      let receivedDraggable: CbrDraggableInterface | undefined;

      // Spy on the `onDragEnd` method of the listener to ensure it gets called
      const listenerSpy = vi.spyOn(listener, 'onDragEnd')
          .mockImplementation((draggable: CbrDraggableInterface) => {
            receivedDraggable = draggable;
          });

      // Add the listener to the draggable engine
      draggableEngine.addEventListener(listener);

      // Call the `dispatchDragEndEvent` method
      draggableEngine.dispatchDragEndEvent();

      // Assertions
      expect(listenerSpy).toHaveBeenCalledOnce(); // Ensure it is called only once
      expect(receivedDraggable).toBe(draggableEngine); // Ensure the draggable passed is the instance itself
    });

    test('no listeners registered', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      // Spy on a mock function to ensure that nothing happens when no listeners are added
      const forEachListenerSpy = vi.spyOn(draggableEngine, 'forEachListener').mockImplementation(() => {});

      // Call the `dispatchDragEndEvent` method
      draggableEngine.dispatchDragEndEvent();

      // Assertions
      expect(forEachListenerSpy).toHaveBeenCalledOnce(); // Ensure `forEachListener` is called
    });
  });

  describe('onDragStart', () => {
    test('success path', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      let receivedState: CbrDraggableState | undefined;

      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
        .mockImplementation((state: CbrDraggableState) => { receivedState = state; });
      const startDragModeSpy = vi.spyOn(draggableEngine.element_, 'startDragMode')
          .mockImplementation((clientX: number, clientY: number) => { });
      const dispatchDragStartEventSpy = vi.spyOn(draggableEngine, 'dispatchDragStartEvent')
          .mockImplementation(() => {});

      draggableEngine.onDragStart(0, 0);

      expect(setStateSpy).toHaveBeenCalled();
      expect(receivedState).not.toBeUndefined();
      expect(receivedState?.state).toBe(CbrDraggableStateEnum.DRAGGING);
      expect(startDragModeSpy).toHaveBeenCalledWith(0, 0);
      expect(dispatchDragStartEventSpy).toHaveBeenCalledOnce();
    });

    test('invalid element', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const elementValidSpy = vi.spyOn(draggableElementMock, 'valid', 'get')
          .mockReturnValue(false);
      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
          .mockImplementation(() => { });

      draggableEngine.onDragStart(0, 0);

      expect(setStateSpy).not.toHaveBeenCalled();
    });
  });

  describe('onDragMove', () => {
    test('invalid element', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const elementValidSpy = vi.spyOn(draggableElementMock, 'valid', 'get').mockReturnValue(false);
      const elementUpdateDragTopLeftPositionSpy = vi.spyOn(draggableElementMock, 'updateDragTopLeftPosition').mockImplementation(() => { });
      const setStateSpy = vi.spyOn(draggableEngine, 'setState').mockImplementation(() => { });

      draggableEngine.onDragMove(0, 0);

      expect(setStateSpy).not.toHaveBeenCalled();
      expect(elementUpdateDragTopLeftPositionSpy).not.toHaveBeenCalled();
    });

    test('drop area is hover area', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const dropAreaElement = jsdom.window.document.querySelector('.hover-area') as HTMLElement;
      const controllerGetDropAreaFromPointSpy = vi.spyOn(controller, 'getDropAreaFromPoint')
          .mockImplementation((x: number, y: number) => { return dropAreaElement; });

      const elementUpdateDragTopLeftPositionSpy = vi.spyOn(draggableElementMock, 'updateDragTopLeftPosition').mockImplementation(() => { });
      const onDragMoveDropAreaChangedSpy = vi.spyOn(draggableEngine, 'onDragMoveDropAreaChanged').mockImplementation(() => { });

      draggableEngine.state.value.hoverArea = dropAreaElement;

      draggableEngine.onDragMove(0, 0);

      expect(elementUpdateDragTopLeftPositionSpy).toHaveBeenCalled();
      expect(onDragMoveDropAreaChangedSpy).not.toHaveBeenCalled();
    });

    test('drop area is different than hover area', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const dropAreaElement = jsdom.window.document.querySelector('.pin-area') as HTMLElement;
      const controllerGetDropAreaFromPointSpy = vi.spyOn(controller, 'getDropAreaFromPoint')
          .mockImplementation((x: number, y: number) => { return dropAreaElement; });

      const elementUpdateDragTopLeftPositionSpy = vi.spyOn(draggableElementMock, 'updateDragTopLeftPosition')
        .mockImplementation(() => { });
      const onDragMoveDropAreaChangedSpy = vi.spyOn(draggableEngine, 'onDragMoveDropAreaChanged')
        .mockImplementation(() => { });

      draggableEngine.state.value.hoverArea = jsdom.window.document.querySelector('.hover-area') as HTMLElement;

      draggableEngine.onDragMove(0, 0);

      expect(elementUpdateDragTopLeftPositionSpy).toHaveBeenCalled();
      expect(onDragMoveDropAreaChangedSpy).toHaveBeenCalled();
    });
  });

  describe('onDragMoveDropAreaChanged', () => {
    test('dropArea defined', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      let receivedEvent : CbrHoverEnterEvent | undefined;
      let stateReceived : CbrDraggableState | undefined;

      const dropAreaElement = jsdom.window.document.querySelector('.pin-area') as HTMLElement;

      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
        .mockImplementation((state: CbrDraggableState) => { stateReceived = state; });
      const dispatchHoverEnterEventSpy = vi.spyOn(draggableEngine, 'dispatchHoverEnterEvent')
          .mockImplementation((event: CbrHoverEnterEvent) => { receivedEvent = event; });

      draggableEngine.state.value.hoverArea = jsdom.window.document.querySelector('.hover-area') as HTMLElement;
      draggableEngine.state.value.pinArea = dropAreaElement;

      draggableEngine.onDragMoveDropAreaChanged(dropAreaElement);

      expect(setStateSpy).toHaveBeenCalled();
      expect(dispatchHoverEnterEventSpy).toHaveBeenCalled();
      expect(receivedEvent).not.toBeUndefined();
      expect(receivedEvent?.element).toBe(draggableRef.value);
      expect(receivedEvent?.dropArea).toBe(dropAreaElement);
      expect(stateReceived).not.toBeUndefined();
      expect(stateReceived.hoverArea).toBe(dropAreaElement);
      expect(stateReceived.state).toBe(CbrDraggableStateEnum.DRAGGING);
      expect(stateReceived.pinArea).toBe(dropAreaElement);
    });

    test('dropArea defined and preventDrop called', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      const listener = {
        onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void { }
      } as CbrDraggableEventsListenerInterface;

      let receivedEvent : CbrHoverEnterEvent | undefined;
      let stateReceived : CbrDraggableState | undefined;

      const dropAreaElement = jsdom.window.document.querySelector('.pin-area') as HTMLElement;

      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
          .mockImplementation((state: CbrDraggableState) => { stateReceived = state; });
      const onHoverEnterSpy = vi.spyOn(listener, 'onHoverEnter')
          .mockImplementation((draggable: CbrDraggableInterface, event: CbrHoverEnterEvent) => {
            receivedEvent = event;
            event.preventDrop();
          });

      draggableEngine.state.value.hoverArea = jsdom.window.document.querySelector('.hover-area') as HTMLElement;
      draggableEngine.state.value.pinArea = dropAreaElement;

      draggableEngine.addEventListener(listener);
      draggableEngine.onDragMoveDropAreaChanged(dropAreaElement);

      expect(setStateSpy).toHaveBeenCalled();
      expect(onHoverEnterSpy).toHaveBeenCalled();
      expect(receivedEvent).not.toBeUndefined();
      expect(receivedEvent?.element).toBe(draggableRef.value);
      expect(receivedEvent?.dropArea).toBe(dropAreaElement);
      expect(stateReceived).not.toBeUndefined();
      expect(stateReceived.hoverArea).toBeUndefined();
      expect(stateReceived.state).toBe(CbrDraggableStateEnum.DRAGGING);
      expect(stateReceived.pinArea).toBe(dropAreaElement);
    });

    test('dropArea undefined', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      let receivedEvent : CbrHoverExitEvent | undefined;
      let stateReceived : CbrDraggableState | undefined;

      const dropAreaElement = jsdom.window.document.querySelector('.pin-area') as HTMLElement;

      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
          .mockImplementation((state: CbrDraggableState) => { stateReceived = state; });
      const dispatchHoverExitEventSpy = vi.spyOn(draggableEngine, 'dispatchHoverExitEvent')
          .mockImplementation((event: CbrHoverExitEvent) => { receivedEvent = event; });

      draggableEngine.state.value.hoverArea = jsdom.window.document.querySelector('.hover-area') as HTMLElement;
      draggableEngine.state.value.pinArea = dropAreaElement;

      draggableEngine.onDragMoveDropAreaChanged(undefined);

      expect(setStateSpy).toHaveBeenCalled();
      expect(dispatchHoverExitEventSpy).toHaveBeenCalledOnce();
      expect(receivedEvent).not.toBeUndefined();
      expect(stateReceived).not.toBeUndefined();
      expect(stateReceived.hoverArea).toBeUndefined();
      expect(stateReceived.state).toBe(CbrDraggableStateEnum.DRAGGING);
      expect(stateReceived.pinArea).toBe(dropAreaElement);
    });
  });

  describe('onDragEnd', () => {
    test('no valid element', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      // Mock the draggable element's validity to be false
      const elementValidSpy = vi.spyOn(draggableElementMock, 'valid', 'get').mockReturnValue(false);
      // Spy on setState and dispatch external calls to ensure they are not called
      const setStateSpy = vi.spyOn(draggableEngine, 'setState').mockImplementation(() => {});
      const dispatchUnpinnedEventSpy = vi.spyOn(draggableEngine, 'dispatchUnpinnedEvent').mockImplementation(() => {});

      // Call the method under test
      draggableEngine.onDragEnd();

      // Expectations - since the element is invalid, no state changes or events should have been dispatched
      expect(elementValidSpy).toHaveBeenCalled();
      expect(setStateSpy).not.toHaveBeenCalled();
      expect(dispatchUnpinnedEventSpy).not.toHaveBeenCalled();
    });

    test('valid element and hoverArea present', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      // Set up a valid element and a hoverArea
      const hoverAreaElement = jsdom.window.document.querySelector('.hover-area') as HTMLElement;
      draggableEngine.state.value.hoverArea = hoverAreaElement;

      // Mock the draggable element to be valid
      const elementValidSpy = vi.spyOn(draggableElementMock, 'valid', 'get')
          .mockReturnValue(true);

      let pinElementReceived : HTMLElement | undefined;

      // Spy on methods that should be called during onDragEnd
      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
          .mockImplementation(() => {});
      const pinSpy = vi.spyOn(draggableEngine, 'pin')
          .mockImplementation((element: HTMLElement) => { pinElementReceived = element; });
      const dispatchDragEndEventSpy = vi.spyOn(draggableEngine, 'dispatchDragEndEvent')
          .mockImplementation(() => {});

      // Call the method under test
      draggableEngine.onDragEnd();

      expect(dispatchDragEndEventSpy).toHaveBeenCalledOnce();

      // Assertions
      // 1. The draggable element is valid
      expect(elementValidSpy).toHaveBeenCalled();

      // 2. Ensure the `pin` method was called with the hover area
      expect(pinSpy).toHaveBeenCalled();
      expect(pinElementReceived).not.toBeUndefined();
      expect(pinElementReceived).toBe(hoverAreaElement);

      // 3. Ensure no unwanted state changes occurred directly
      expect(setStateSpy).not.toHaveBeenCalled();
    });

    test('valid element and no hoverArea present', () => {

      const draggableEngine = new CbrDraggableEngine(props, options);

      // Mock the draggable element to be valid
      const elementValidSpy = vi.spyOn(draggableElementMock, 'valid', 'get')
          .mockReturnValue(true);

      const pinAreaElement : HTMLElement = jsdom.window.document.querySelector('.pin-area') as HTMLElement;

      // Ensure hoverArea is not set
      draggableEngine.state.value.hoverArea = undefined;
      draggableEngine.state.value.pinArea = pinAreaElement;

      let receivedState : CbrDraggableState | undefined;

      // Spy on methods called during onDragEnd
      const setStateSpy = vi.spyOn(draggableEngine, 'setState')
          .mockImplementation((state: CbrDraggableState) => { receivedState = state; });
      const resetElementPositionSpy = vi.spyOn(controller, 'resetElementPosition')
          .mockImplementation(() => {});

      // Call the method under test
      draggableEngine.onDragEnd();

      // Assertions
      // 1. The draggable element should be valid
      expect(elementValidSpy).toHaveBeenCalled();

      expect(resetElementPositionSpy).toHaveBeenCalledOnce();

      // 3. Ensure the state is set to FREE
      expect(setStateSpy).toHaveBeenCalled();
      expect(receivedState).not.toBeUndefined();
      expect(receivedState.pinArea).toBe(pinAreaElement);
    });
  });
});
