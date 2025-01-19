import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CbrDraggableProps, CbrDraggableState, CbrDraggableStateEnum, CbrPinEvent, CbrUnpinnedEvent } from '@/cbrDragNDropTypes.ts';
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
    addAsChildToElement(element: HTMLElement): void { }
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
});
