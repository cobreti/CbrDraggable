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
        <div id="container">
            <div id="draggable-item"></div>
        </div>
      </body>
    </html>`);

  const elmWidth = 100;
  const elmHeight = 20;
  const draggableRef : Ref<HTMLElement> = ref<HTMLElement>(jsdom.window.document.querySelector('#draggable-item'));

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
      expect(draggableElement.htmlElement).toBe(jsdom.window.document.querySelector('#draggable-item'));
      expect(draggableElement.element_).toBe(jsdom.window.document.querySelector('#draggable-item'));
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

  describe('startDragMode', () => {

    test('valid element', () => {
      const draggableElement = new CbrDraggableElement(options);

      const savePropsSpy = vi.spyOn(draggableElement, 'saveProps');

      draggableElement.startDragMode(0, 0);

      const parent = draggableElement.element_.parentElement;
      const body = jsdom.window.document.body;

      expect(draggableElement.htmlElement.style.position).toBe('fixed');
      expect(draggableElement.htmlElement.style.left).toBe('0px');
      expect(draggableElement.htmlElement.style.top).toBe('0px');
      expect(parent).toBe(body);
      expect(savePropsSpy).toHaveBeenCalled();
    });

    test('invalid element', () => {
      const hooks = {onMounted: () => {}};
      const options = {draggableRef, hooks};
      const draggableElement = new CbrDraggableElement(options);

      const savePropsSpy = vi.spyOn(draggableElement, 'saveProps');

      draggableElement.startDragMode(0, 0);

      expect(savePropsSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateDragTopLeftPosition', () => {

    test('valid element', () => {
      const draggableElement = new CbrDraggableElement(options);

      Object.defineProperty(draggableElement.htmlElement, 'clientWidth', {value: elmWidth});
      Object.defineProperty(draggableElement.htmlElement, 'clientHeight', {value: elmHeight});
      draggableElement.updateDragTopLeftPosition(100, 100);

      expect(draggableElement.htmlElement.style.left).toBe('50px');
      expect(draggableElement.htmlElement.style.top).toBe('90px');
    });

  });

  describe('restoreElementProps', () => {

    test('valid element', () => {
      const draggableElement = new CbrDraggableElement(options);

      const props = {
        position: 'fixed',
        left: '0px',
        top: '0px',
        parent: jsdom.window.document.querySelector('body')
      };

      draggableElement.savedProps_.push(props);

      draggableElement.restoreSavedProps();

      const parent = draggableElement.element_.parentElement;

      expect(draggableElement.htmlElement.style.position).toBe(props.position);
      expect(draggableElement.htmlElement.style.left).toBe(props.left);
      expect(draggableElement.htmlElement.style.top).toBe(props.top);
      expect(parent).toBe(props.parent);
    });
  });

  describe('addAsChildToElement', () => {

    test('no saved props', () => {
      const draggableElement = new CbrDraggableElement(options);

      const parent = jsdom.window.document.createElement('div');
      draggableElement.addAsChildToElement(parent);

      expect(draggableElement.htmlElement.parentElement).toBe(parent);
    });

    test('with saved props', () => {
      const draggableElement = new CbrDraggableElement(options);

      const props = {
        position: 'fixed',
        left: '10px',
        top: '20px',
        parent: jsdom.window.document.querySelector('body')
      };

      draggableElement.savedProps_.push(props);

      const parent = jsdom.window.document.createElement('div');
      draggableElement.addAsChildToElement(parent);

      const htmlElement = draggableElement.htmlElement;

      expect(htmlElement.parentElement).toBe(parent);
      expect(htmlElement.style.position).toBe('fixed');
      expect(htmlElement.style.left).toBe('10px');
      expect(htmlElement.style.top).toBe('20px');
    });
  });

  describe('discardElementSavedProps', () => {

    test('valid element', () => {
      const draggableElement = new CbrDraggableElement(options);

      const props = {
        position: 'fixed',
        left: '0px',
        top: '0px',
        parent: jsdom.window.document.querySelector('body')
      };

      draggableElement.savedProps_.push(props);

      draggableElement.discardSavedProps();

      expect(draggableElement.savedProps_.length).toBe(0);
    });

  });
});
