import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {CbrDraggableProps, CbrDraggableState, CbrDraggableStateEnum} from '@/cbrDragNDropTypes.ts';
import {JSDOM} from 'jsdom';
import {Ref, ref} from 'vue';
import {CbrDraggableEngine, DraggableEngineOptions} from '@/cbrDraggableEngine.ts';
import {CbrDraggableController, CbrDraggableControllerOptions} from '@/cbrDraggableController.ts';
import {CbrDraggableElement, CbrDraggableElementOptions} from '@/cbrDraggableElement.js';
import {CbrDraggableEventsListenerInterface, type CbrDraggableInterface} from '@/cbrDraggableInterface.js';

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
        </div>
      </body>
    </html>`);


  const draggableId = 'drag1';
  const draggableRef : Ref<HTMLElement> = ref<HTMLElement>(jsdom.window.document.querySelector('#draggable-item'));
  const controllerOptions : CbrDraggableControllerOptions = {
    pinAreaSelector: '.pin-area',
    freeAreaSelector: '.free-area'
  }
  let controller : CbrDraggableController;

  function onMounted(callback: () => void) : void {
    callback();
  }

  const draggableElementMock = {
    get valid() : boolean { return true; },
    restoreSavedProps(): void {}
  } as CbrDraggableElement;

  const options : DraggableEngineOptions = {
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

      const registerDraggableSpy = vi.spyOn(controller, 'registerDraggable').mockImplementation(() => {});
      const mountedSpy = vi.spyOn(options.hooks, 'onMounted');

      const draggableEngine = new CbrDraggableEngine(props, options);

      expect(draggableEngine.element_).not.toBeNull();
      expect(registerDraggableSpy).toHaveBeenCalledTimes(1);
      expect(mountedSpy).toHaveBeenCalledTimes(1);
      expect(draggableEngine.freeArea_.value).toBe(jsdom.window.document.querySelector('.free-area'));
      expect(draggableEngine.state_.value).toEqual( { state: CbrDraggableStateEnum.FREE });
      expect(draggableEngine.id).toBe(draggableId);
      expect(draggableEngine.pinArea).toBeUndefined();
      expect(draggableEngine.hoverArea).toBeUndefined();
      expect(draggableEngine.controller).toBe(controller);
      expect(draggableEngine.element).toBe(draggableElementMock.htmlElement);
    });

    test('listener presents', () => {

      const listener = {
        onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void {}
      } as CbrDraggableEventsListenerInterface;

      const registerDraggableSpy = vi.spyOn(controller, 'registerDraggable').mockImplementation(() => {});
      const mountedSpy = vi.spyOn(options.hooks, 'onMounted');
      const localProps = { ...props, eventListener: listener };
      const listenerSpy = vi.spyOn(listener, 'onStateChanged');

      const draggableEngine = new CbrDraggableEngine(localProps, options);

      expect(draggableEngine.element_).not.toBeNull();
      expect(registerDraggableSpy).toHaveBeenCalledTimes(1);
      expect(mountedSpy).toHaveBeenCalledTimes(1);
      expect(draggableEngine.freeArea_.value).toBe(jsdom.window.document.querySelector('.free-area'));
      expect(draggableEngine.state_.value).toEqual( { state: CbrDraggableStateEnum.FREE });
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
      const addToFreeAreaSpy = vi.spyOn(draggableEngine, 'addToFreeArea').mockImplementation(() => {});
      const setStateSpy = vi.spyOn(draggableEngine, 'setState').mockImplementation(() => {});

      draggableEngine.unpin();

      expect(addToFreeAreaSpy).not.toHaveBeenCalled();
      expect(setStateSpy).not.toHaveBeenCalled();
    });

    test('no pin area', () => {
      const draggableEngine = new CbrDraggableEngine(props, options);

      draggableEngine.state.value = {
        state: CbrDraggableStateEnum.DRAGGING
      };

      const addToFreeAreaSpy = vi.spyOn(draggableEngine, 'addToFreeArea').mockImplementation(() => {});
      const setStateSpy = vi.spyOn(draggableEngine, 'setState');
      const restoreSavedPropsSpy = vi.spyOn(draggableElementMock, 'restoreSavedProps').mockImplementation(() => {});

      draggableEngine.unpin();

      expect(addToFreeAreaSpy).toHaveBeenCalled();
      expect(setStateSpy).toHaveBeenCalled();
      expect(restoreSavedPropsSpy).toHaveBeenCalled();
      expect(draggableEngine.state.value.state).toBe(CbrDraggableStateEnum.FREE);
    });
  });
});
