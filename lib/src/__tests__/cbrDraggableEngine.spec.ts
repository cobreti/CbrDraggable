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
      id: 'drag1',
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

    test('success path no listener', () => {

      const registerDraggableSpy = vi.spyOn(controller, 'registerDraggable').mockImplementation(() => {});
      const mountedSpy = vi.spyOn(options.hooks, 'onMounted');

      const draggableEngine = new CbrDraggableEngine(props, options);

      expect(draggableEngine.element_).not.toBeNull();
      expect(registerDraggableSpy).toHaveBeenCalledTimes(1);
      expect(mountedSpy).toHaveBeenCalledTimes(1);
      expect(draggableEngine.freeArea_.value).toBe(jsdom.window.document.querySelector('.free-area'));
      expect(draggableEngine.state_.value).toEqual( { state: CbrDraggableStateEnum.FREE });
    });

    test('success path with listener', () => {

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
      expect(listenerSpy).toHaveBeenCalledTimes(1);
    });

  });

});
