import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {JSDOM} from 'jsdom';
import {Ref, ref} from 'vue';
import {CbrDraggableElement} from '@/cbrDraggableElement.js';

declare namespace global {
  let document: Document;
}

describe('cbrDraggableElement', () => {

  let jsdom: JSDOM = new JSDOM(`
    <html>
      <body>
        <div ref="draggable-item"></div>
      </body>
    </html>`);

  const draggableRef : Ref<HTMLElement> = ref<HTMLElement>(jsdom.window.document.querySelector('[ref="draggable-item"]'));

  function onMounted(callback: () => void) : void {
    callback();
  }

  const hooks = {onMounted};
  const options = {draggableRef, hooks};

  beforeEach(() => {
    global.document = jsdom.window.document;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.resetModules();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {

    test('onMounted called', () => {
      const draggableElement = new CbrDraggableElement(options);

      expect(draggableElement.valid).toBe(true);
      expect(draggableElement.htmlElement).toBe(jsdom.window.document.querySelector('[ref="draggable-item"]'));
      expect(draggableElement.element_).toBe(jsdom.window.document.querySelector('[ref="draggable-item"]'));
    });

    test('onMounted not called', () => {
      const hooks = {onMounted: () => {}};
      const options = {draggableRef, hooks};
      const draggableElement = new CbrDraggableElement(options);

      expect(draggableElement.valid).toBe(false);
      expect(draggableElement.element_).toBe(null);
      expect(() => draggableElement.htmlElement).toThrowError('HTML Element not found');
    })
  });

});
