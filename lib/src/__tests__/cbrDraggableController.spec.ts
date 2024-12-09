import { afterEach, describe, expect, test, vi } from 'vitest';
import { CbrDraggableController, CbrDraggableControllerOptions } from '../cbrDraggableController.ts';
import { JSDOM } from 'jsdom';

describe('CbrDraggableController', () => {
    describe('construction', () => {

        const pinAreaSelector = '.pin-area';
        const freeAreaSelector = '.free-area';

        let jsdom : JSDOM;

        afterEach( () => {
            vi.clearAllMocks();
            vi.resetAllMocks();
            vi.resetModules();
            vi.restoreAllMocks();
        });

        test('keeping options', () => {

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            expect(controller).not.toBeNull();
            expect(controller.freeAreaSelector_).toEqual(freeAreaSelector);
            expect(controller.pinAreaSelector_).toEqual(pinAreaSelector);
            expect(controller.freeAreaSelector).toEqual(freeAreaSelector);
        });
    });

    describe('freeAreaElement', () => {

        const pinAreaSelector = '.pin-area';
        const freeAreaSelector = '.free-area';

        let jsdom : JSDOM;

        afterEach( () => {
            vi.clearAllMocks();
            vi.resetAllMocks();
            vi.resetModules();
            vi.restoreAllMocks();
        });

        test('freeAreaElement success', () => {

            jsdom = new JSDOM(`
                <html>
                    <body>
                        <div class="free-area"></div>
                    </body>
                </html>
            `);

            global.document = jsdom.window.document;

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            expect(controller.freeAreaElement).not.toBeNull();
            expect(controller.freeAreaElement.className).toEqual('free-area');
        });

        test('freeAreaElement failure', () => {            
            jsdom = new JSDOM(`
                <html>
                    <body>
                        <div class="free-area"></div>
                    </body>
                </html>
            `);

            global.document = jsdom.window.document;

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: '.no-free-area'
            };

            const controller = new CbrDraggableController(options);

            expect(controller.freeAreaElement).toBeNull();
        })
    });

    describe('getPinAreaFromPoint', () => {

        test('getPinAreaFromPoint success', () => {
                
            const pinAreaSelector = '.pin-area';
            const freeAreaSelector = '.free-area';

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            const x = 0;
            const y = 0;

            const jsdom = new JSDOM(`
                <html>
                    <body>
                        <div class="pin-area"></div>
                    </body>
                </html>
            `);

            const pinElement = jsdom.window.document.createElement('div');
            pinElement.className = 'pin-area';

            jsdom.window.document.elementsFromPoint = vi.fn().mockReturnValue([
                pinElement
            ]);

            global.document = jsdom.window.document;

            const element = controller.getPinAreaFromPoint(x, y);

            expect(element).not.toBeUndefined();
            expect(element.className).toEqual('pin-area');
        });

        test('getPinAreaFromPoint failure', () => {                   
            const pinAreaSelector = '.pin-area';
            const freeAreaSelector = '.free-area';

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            const x = 0;
            const y = 0;

            const jsdom = new JSDOM(`
                <html>
                    <body>
                    </body>
                </html>
            `);

            jsdom.window.document.elementsFromPoint = vi.fn().mockReturnValue([]);

            global.document = jsdom.window.document;

            const element = controller.getPinAreaFromPoint(x, y);

            expect(element).toBeUndefined();
        });

        test('getPinAreaFromPoint no pinAreaSelector', () => {
            const pinAreaSelector = '';
            const freeAreaSelector = '.free-area';

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            const x = 0;
            const y = 0;

            const jsdom = new JSDOM(`
                <html>
                    <body>
                    </body>
                </html>
            `);

            jsdom.window.document.elementsFromPoint = vi.fn().mockReturnValue([]);

            global.document = jsdom.window.document;

            const element = controller.getPinAreaFromPoint(x, y);

            expect(element).toBeUndefined();
        });
    });
});

