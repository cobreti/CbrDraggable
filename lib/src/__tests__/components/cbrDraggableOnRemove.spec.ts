import {afterEach, describe, expect, test, vi} from 'vitest';
import {CbrDraggableInterface} from '@/cbrDraggableInterface.js';
import {mount} from '@vue/test-utils';
import CbrDraggableOnRemove from '@/components/cbrDraggableOnRemove.vue';
import {CbrDraggableEventsListener} from '@/eventsListeners/cbrDraggableEventsListener.js';
import {draggableESShowAdd, draggableESShowRemove} from '@/keys.js';

describe('CbrDraggableOnRemove()', async () => {

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

  function setup(): HoistedFunctions {
    const hoistedFct = vi.hoisted(() => {
      return {
        inject: vi.fn()
      }
    });

    vi.mock('vue', async (importOriginal) => {
      return {
        ...await importOriginal(),
        inject: hoistedFct.inject
      }
    });

    vi.spyOn(hoistedFct, 'inject')
        .mockReturnValue(mockDraggable);

    return hoistedFct;
  }

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  test('object visible by default', () => {
    const hoistedFct = setup();

    const component = mount(CbrDraggableOnRemove, {
      template: '<div>test</div>',
      props: {}
    });

    expect(component.find('div').isVisible()).toBe(false);

    component.unmount();
  });

  test('object added as event listener', () => {

    const hoistedFct = setup();

    const addEventListenerSpy = vi.spyOn(mockDraggable, 'addEventListener');

    const component = mount(CbrDraggableOnRemove, {
      template: '<div>test</div>',
      props: {

      }
    });

    expect(addEventListenerSpy).toHaveBeenCalled();

    component.unmount();
  });

  test('click emitted', () => {

    const hoistedFct = setup();

    const component = mount(CbrDraggableOnRemove, {
      template: '<div>test</div>',
      props: {  }
    });

    component.find('div').trigger('click');

    expect(component.emitted().click[0]).toEqual([mockDraggable]);

    component.unmount();
  });

  test('component visible if ESShowRemove is true', async () => {
    const hoistedFct = setup();

    let listener : CbrDraggableEventsListener | undefined;

    const addEventListenerSpy = vi.spyOn(mockDraggable, 'addEventListener')
        .mockImplementation((l) => {
          listener = l;
        });

    const component = mount(CbrDraggableOnRemove, {
      template: '<div class="test">test</div>',
      props: {
      }
    });

    expect(listener).not.toBeUndefined();

    listener.onExternalStateChanged(mockDraggable, draggableESShowRemove, true, true);

    await component.vm.$nextTick();

    expect(component.vm.$el.style.display).not.toBe('none');

    component.unmount();
  });

  test('component visibility toggle true/false on successive ESShowRemove events', async () => {
    const hoistedFct = setup();

    let listener : CbrDraggableEventsListener | undefined;

    const addEventListenerSpy = vi.spyOn(mockDraggable, 'addEventListener')
        .mockImplementation((l) => {
          listener = l;
        });

    const component = mount(CbrDraggableOnRemove, {
      template: '<div class="test">test</div>',
      props: {
      }
    });

    expect(listener).not.toBeUndefined();

    listener.onExternalStateChanged(mockDraggable, draggableESShowRemove, true, true);

    await component.vm.$nextTick();

    //
    //  using
    //    component.find('div').isVisible()
    //  seems to prevent consecutive DOM updates
    //  checking display style directly on $el instead
    //

    // expect(component.find('div').isVisible()).toBe(true);
    expect(component.vm.$el.style.display).not.toBe('none');

    listener.onExternalStateChanged(mockDraggable, draggableESShowRemove, true, false);

    await component.vm.$nextTick();

    // expect(component.find('div').isVisible()).toBe(false);
    expect(component.vm.$el.style.display).toBe('none');

    component.unmount();
  });

  test('other events than ESShowRemove should not affect visibility', async () => {
    const hoistedFct = setup();

    let listener : CbrDraggableEventsListener | undefined;

    const addEventListenerSpy = vi.spyOn(mockDraggable, 'addEventListener')
        .mockImplementation((l) => {
          listener = l;
        });

    const component = mount(CbrDraggableOnRemove, {
      template: '<div class="test">test</div>',
      props: {
      }
    });

    expect(listener).not.toBeUndefined();
    expect(component.vm.$el.style.display).toBe('none');

    listener.onExternalStateChanged(mockDraggable, draggableESShowAdd, true, true);

    await component.vm.$nextTick();

    expect(component.vm.$el.style.display).toBe('none');
  });
});
