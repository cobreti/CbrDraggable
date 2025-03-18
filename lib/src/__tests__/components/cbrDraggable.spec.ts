import { mount, config } from '@vue/test-utils';
import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest';
import  CbrDraggable from '../../components/cbrDraggable.vue';
import {CbrDraggableEventsListenerInterface, CbrDraggableInterface} from '@/cbrDraggableInterface.js';
import {CbrDraggableEngine, DraggableEngineOptions} from '@/cbrDraggableEngine.js';
import {CbrDraggableProps} from '@/cbrDragNDropTypes.js';
import {CbrDraggableControllerInterface} from '@/cbrDraggableController.js';
import {Observable, of} from 'rxjs';



describe('CbrDraggable component', async () => {

  //
  // stub for draggable engine
  //
  const draggableEngine = {
    id: 'mock-id',
    pinArea: undefined,
    hoverArea: undefined,
    element: undefined,
    controller: undefined,

    unpin: () => {},
    pin: (pinArea: HTMLElement) => {},
    addEventListener: (eventListener: CbrDraggableEventsListenerInterface) => {},
    removeEventListener: (eventListener: CbrDraggableEventsListenerInterface) => {},
    forEachListener: (callback: (eventListener: CbrDraggableEventsListenerInterface) => void) => {},
    updateExternalState: (externalState: string, value: any) => {},
    getExternalState: (externalState: string) => {},
    onMouseDown: (event: MouseEvent): boolean => { return true; },
    onMouseMove: (event: MouseEvent): void => {},
    onMouseUp: (event: MouseEvent): void => {},
    onTouchStart: (event: TouchEvent): boolean => { return true;},
    onTouchMove: (event: TouchEvent): void => {},
    onTouchEnd: (event: TouchEvent): void => {},
    onTouchCancel: (event: TouchEvent): void => {}
  };

  //
  // stub for draggable controller
  //
  const draggableController: CbrDraggableControllerInterface = {
    pinAreaElement: global.document.createElement('div'),
    freeAreaElement: global.document.createElement('div'),
    freeAreaSelector: '.free-area',

    getDropAreaFromPoint: (x: number, y: number): HTMLElement | undefined => {
      return global.document.createElement('div');
    },

    canPick: (elm: HTMLElement): boolean => {
      return true;
    },

    addToFreeArea: (elm: HTMLElement, freeArea: HTMLElement): void => {
      // Mock implementation
    },

    resetElementPosition: (elm: HTMLElement): void => {
      // Mock implementation
    },

    registerDraggable: (draggable: CbrDraggableInterface): void => {
      // Mock implementation
    },

    getDraggable: (id: string): CbrDraggableInterface => {
      return draggableEngine;
    },

    getDraggableObserver: (id: string): Observable<CbrDraggableInterface | undefined> => {
      return of(undefined);
    }
  };

  type HoistedFunctions = {
    provide: () => void,
    createDraggableEngine: (props: CbrDraggableProps, options: DraggableEngineOptions) => CbrDraggableEngine
  };

  function setup() : HoistedFunctions {
    const hoistedFct = vi.hoisted(() => {
      return {
        provide: vi.fn(),
        createDraggableEngine: vi.fn()
      }
    });

    vi.mock('vue', async (importOriginal) => {
      return {
        ...await importOriginal(),
        provide: hoistedFct.provide
      }
    });

    vi.mock('@/cbrDraggableEngine.ts', async (importOriginal) => {
      return {
        ...await importOriginal(),
        createDraggableEngine: hoistedFct.createDraggableEngine
      }
    });

    vi.spyOn(hoistedFct, 'createDraggableEngine')
        .mockReturnValue(draggableEngine);

    return hoistedFct;
  }

  beforeEach(() => {
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  })

  test('provide called', () => {
    const hoistedFct = setup();

    const provideSpy = vi.spyOn(hoistedFct, 'provide');

    const draggable = mount(CbrDraggable,{
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    draggable.unmount();

    expect(provideSpy).toHaveBeenCalled();
  });

  test('draggable core instance exists and event listeners called', () => {

    const hoistedFct = setup();

    const addEventListenerSpy = vi.spyOn(draggableEngine, 'addEventListener')
        .mockImplementation(() => {});
    const createDraggableEngineSpy = vi.spyOn(hoistedFct, 'createDraggableEngine');

    const draggable = mount(CbrDraggable,{
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(createDraggableEngineSpy).toHaveBeenCalled();

    draggable.unmount();
  });

  test('unmount removes event listeners', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable, {
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    draggable.unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(5);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));
  });

  test('mouse down returns true : listener registered', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable,{
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const mouseDownSpy = vi.spyOn(draggableEngine, 'onMouseDown');
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    await draggable.find('.draggable-content').trigger('mousedown');

    expect(mouseDownSpy).toHaveBeenCalled();
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

    draggable.unmount();
  });

  test('mouse down returns false : no listener registered', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable,{
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const mouseDownSpy = vi.spyOn(draggableEngine, 'onMouseDown')
        .mockReturnValue(false);

    await draggable.find('.draggable-content').trigger('mousedown');

    expect(mouseDownSpy).toHaveBeenCalled();

    draggable.unmount();
  });

  test('mouse move sent to window is received by draggable engine', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable,{
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const mouseDownSpy = vi.spyOn(draggableEngine, 'onMouseDown');
    const mouseMoveSpy = vi.spyOn(draggableEngine, 'onMouseMove');

    await draggable.find('.draggable-content').trigger('mousedown');

    global.window.dispatchEvent(new MouseEvent('mousemove'));

    expect(mouseDownSpy).toHaveBeenCalled();
    expect(mouseMoveSpy).toHaveBeenCalled();

    draggable.unmount();
  });

  test('mouse up sent to window remove event listeners', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable, {
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const mouseDownSpy = vi.spyOn(draggableEngine, 'onMouseDown');
    const mouseUpSpy = vi.spyOn(draggableEngine, 'onMouseUp');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    await draggable.find('.draggable-content').trigger('mousedown');

    global.window.dispatchEvent(new MouseEvent('mouseup'));

    expect(mouseDownSpy).toHaveBeenCalled();
    expect(mouseUpSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

    draggable.unmount();
  });

  test('touch start registers touch event listeners', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable, {
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const touchStartSpy = vi.spyOn(draggableEngine, 'onTouchStart');
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    await draggable.find('.draggable-content').trigger('touchstart');

    expect(touchStartSpy).toHaveBeenCalled();
    expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));

    draggable.unmount();
  });

  test('touch start returns false : no listener registered', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable, {
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const touchStartSpy = vi.spyOn(draggableEngine, 'onTouchStart')
        .mockReturnValue(false);
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    await draggable.find('.draggable-content').trigger('touchstart');

    expect(touchStartSpy).toHaveBeenCalled();
    expect(addEventListenerSpy).not.toHaveBeenCalled();

    draggable.unmount();
  });

  test('touch move sent to window is received by draggable engine', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable, {
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const touchStartSpy = vi.spyOn(draggableEngine, 'onTouchStart');
    const touchMoveSpy = vi.spyOn(draggableEngine, 'onTouchMove');

    await draggable.find('.draggable-content').trigger('touchstart');

    global.window.dispatchEvent(new TouchEvent('touchmove'));

    expect(touchStartSpy).toHaveBeenCalled();
    expect(touchMoveSpy).toHaveBeenCalled();

    draggable.unmount();
  });

  test('touch end sent to window removes touch event listeners', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable, {
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const touchStartSpy = vi.spyOn(draggableEngine, 'onTouchStart');
    const touchEndSpy = vi.spyOn(draggableEngine, 'onTouchEnd');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    await draggable.find('.draggable-content').trigger('touchstart');

    global.window.dispatchEvent(new TouchEvent('touchend'));

    expect(touchStartSpy).toHaveBeenCalled();
    expect(touchEndSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));

    draggable.unmount();
  });

  test('touch cancel sent to window removes touch event listeners', async () => {
    const hoistedFct = setup();

    const draggable = mount(CbrDraggable, {
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableController
      }
    });

    const touchStartSpy = vi.spyOn(draggableEngine, 'onTouchStart');
    const touchCancelSpy = vi.spyOn(draggableEngine, 'onTouchCancel');
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    await draggable.find('.draggable-content').trigger('touchstart');

    global.window.dispatchEvent(new TouchEvent('touchcancel'));

    expect(touchStartSpy).toHaveBeenCalled();
    expect(touchCancelSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchcancel', expect.any(Function));

    draggable.unmount();
  });
});
