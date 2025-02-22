import { mount, config } from '@vue/test-utils';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import  CbrDraggable from '../../components/cbrDraggable.vue';
import {CbrDraggableControllerInterface} from '@/cbrDraggableController.js';
import {CbrDraggableInterface} from '@/cbrDraggableInterface.js';
import {defineComponent, provide} from 'vue';





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

  test('provide called', () => {

    const hoistedFct = vi.hoisted(() => {
      return {
        provide: vi.fn()
      }
    });

    vi.mock('vue', async (importOriginal) => {
      return {
        ...await importOriginal(),
        provide: hoistedFct.provide
      }
    });

    const provideSpy = vi.spyOn(hoistedFct, 'provide');

    const draggable = mount(CbrDraggable,{
      template: `<div>test</div>`,
      props: {
        id: 'test',
        controller: draggableEngine
      }
    });

    expect(provideSpy).toHaveBeenCalled();
  })
});
