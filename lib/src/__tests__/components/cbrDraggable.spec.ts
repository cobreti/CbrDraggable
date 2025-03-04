import { mount, config } from '@vue/test-utils';
import {describe, test, expect, vi, beforeEach, afterEach} from 'vitest';
import  CbrDraggable from '../../components/cbrDraggable.vue';
import {CbrDraggableControllerInterface} from '@/cbrDraggableController.js';
import {CbrDraggableInterface} from '@/cbrDraggableInterface.js';
import {CbrDraggableEngine} from '@/cbrDraggableEngine.js';
import {CbrDraggableProps} from '@/cbrDragNDropTypes.js';



describe('CbrDraggable component', () => {

  const draggableEngine = {
    registerDraggable: (draggable: CbrDraggableInterface) => {
    }
  } as CbrDraggableControllerInterface;


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
    const provideHoistedFct = vi.hoisted(() => {
      return {
        provide: vi.fn()
      }
    });

    vi.mock('vue', async (importOriginal) => {
      return {
        ...await importOriginal(),
        provide: provideHoistedFct.provide
      }
    });

    const provideSpy = vi.spyOn(provideHoistedFct, 'provide');

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

    const draggableCore = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    } as Partial<CbrDraggableEngine> as CbrDraggableEngine;


    const createDraggableEngineHoistedFct = vi.hoisted(() => {
      return {
        createDraggableEngine: vi.fn()
      }
    });

    vi.mock('@/cbrDraggableEngine.js', async (importOriginal) => {
      return {
        ...await importOriginal(),
        createDraggableEngine: createDraggableEngineHoistedFct.createDraggableEngine
      }
    });

    // vi.spyOn(global, 'createDraggableEngine')
    //   .mockImplementation((props: CbrDraggableProps) => {
    //     return draggableCore;
    //   });

    const draggable = mount(CbrDraggable,{
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableEngine
      },
      global: {
        mocks: {
          createDraggableEngine: (props: CbrDraggableProps): CbrDraggableEngine => {
            return draggableCore;
          }
        }
      }
    });
  });
});
