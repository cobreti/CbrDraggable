import { describe, test, expect, vi, afterEach } from 'vitest';
import {CbrDraggableInterface} from '@/cbrDraggableInterface.js';
import {inject} from 'vue';
import CbrDraggableOnAdd from '@/components/cbrDraggableOnAdd.vue';
import {mount} from '@vue/test-utils';

describe('CbrDraggableOnAdd()', () => {

  const mockDraggable: CbrDraggableInterface = {
    id: 'test',
    pinArea: undefined,
    hoverArea: undefined,
    element: undefined,
    controller: undefined,
    unpin: vi.fn(),
    pin: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    forEachListener: vi.fn(),
    updateExternalState: vi.fn(),
    getExternalState: vi.fn(),
  };

  type HoistedFunctions = {
    inject: () => CbrDraggableInterface
  };

  function setup() : HoistedFunctions {
    const hoistedFct = vi.hoisted(() => {
      return {
        inject: vi.fn()
      }
    });

    vi.mock( 'vue', async (importOriginal) => {
      return {
        ...await importOriginal(),
        inject: hoistedFct.inject
      }
    });

    vi.spyOn(hoistedFct, 'inject')
        .mockReturnValue(mockDraggable);

    return hoistedFct;
  }

  afterEach( () => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  test('object added as event listener', () => {

    const hoistedFct = setup();

    const addEventListenerSpy = vi.spyOn(mockDraggable, 'addEventListener');

    const component = mount(CbrDraggableOnAdd, {
      template: '<div>test</div>',
      props: {

      }
    });

    expect(addEventListenerSpy).toHaveBeenCalled();

    component.unmount();
  });

});
