import { mount, config } from '@vue/test-utils';
import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest';
import  CbrDraggable from '../../components/cbrDraggable.vue';
import {CbrDraggableEventsListenerInterface, CbrDraggableInterface} from '@/cbrDraggableInterface.js';
import {CbrDraggableEngine, createDraggableEngine, DraggableEngineOptions} from '@/cbrDraggableEngine.js';
import {CbrDraggableProps} from '@/cbrDragNDropTypes.js';



describe('CbrDraggable component', () => {

  const draggableEngine = {
    registerDraggable: (draggable: CbrDraggableInterface) => {},
    addEventListener: (eventListener: CbrDraggableEventsListenerInterface) => {}
  } as Partial<CbrDraggableInterface>;

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

    vi.mock('@/cbrDraggableEngine.js', async (importOriginal) => {
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
    config.global.mocks = {
      provide: (key: any, value: any) => {
        console.log('test');
      }
    };
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
        controller: draggableEngine
      }
    });

    expect(provideSpy).toHaveBeenCalled();
  });

  test('draggable core instance exists and event listeners called', () => {

    const hoistedFct = setup();

    const addEventListenerSpy = vi.spyOn(draggableEngine, 'addEventListener');
    const createDraggableEngineSpy = vi.spyOn(hoistedFct, 'createDraggableEngine');

    const draggable = mount(CbrDraggable,{
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableEngine
      }
    });

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
    expect(createDraggableEngineSpy).toHaveBeenCalled();
  });
});
