import { afterEach, describe, expect, test, vi } from 'vitest';
import { CbrDraggableController, CbrDraggableControllerOptions, DraggableBehaviorSubject } from '../cbrDraggableController.ts';
import { JSDOM } from 'jsdom';
import { CbrDraggableEventsListenerInterface, CbrDraggableInterface } from '@/cbrDraggableInterface.ts';
import { ref, Ref } from 'vue';

declare namespace global {
    let document: Document;
}

describe('CbrDraggableController', () => {

    const pinAreaSelector = '.pin-area';
    const freeAreaSelector = '.free-area';
    const draggableObjectId = 'draggable-object-id';

    class DraggableObject implements CbrDraggableInterface {
        addEventListener(eventListener: CbrDraggableEventsListenerInterface) {
        }
        removeEventListener(eventListener: CbrDraggableEventsListenerInterface) {
        }
        forEachListener(callback: (eventListener: CbrDraggableEventsListenerInterface) => void) {
        }

        showAddIcon_: Ref<boolean> = ref(true);
        showRemoveIcon_: Ref<boolean> = ref(true);

        get id() { return draggableObjectId; }
        get showAddIcon(): Ref<boolean> { return this.showAddIcon_; }
        get showRemoveIcon(): Ref<boolean> { return this.showRemoveIcon_; }
        get pinArea(): HTMLElement | null { return null; }
        get hoverArea(): HTMLElement | null { return null;}
        get element(): HTMLElement | null { return null; }

        unpin(): void {}
        pin(pinArea: HTMLElement): void {}
    }

    let jsdom : JSDOM;

    afterEach( () => {
        vi.clearAllMocks();
        vi.resetAllMocks();
        vi.resetModules();
        vi.restoreAllMocks();
    });

    describe('construction', () => {

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
            expect(controller.pinAreaSelector).toEqual(pinAreaSelector);
        });
    });

    describe('freeAreaElement', () => {

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

    describe('pinAreaElement', () => {

        test('pinAreaElement success', () => {

            jsdom = new JSDOM(`
                <html>
                    <body>
                        <div class="pin-area"></div>
                    </body>
                </html>
            `);

            global.document = jsdom.window.document;

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            expect(controller.pinAreaElement).not.toBeNull();
            expect(controller.pinAreaElement.className).toEqual('pin-area');
        });

        test('pinAreaElement failure', () => {            
            jsdom = new JSDOM(`
                <html>
                    <body>
                        <div class="pin-area"></div>
                    </body>
                </html>
            `);

            global.document = jsdom.window.document;

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: '.no-pin-area',
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            expect(controller.pinAreaElement).toBeNull();
        })

    });

    describe('getPinAreaFromPoint', () => {

        test('getPinAreaFromPoint success', () => {
                
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
            const emptyPinAreaSelector = '';

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: emptyPinAreaSelector,
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

    describe('canPick', () => {

        test('canPick pick disabled', () => {
            jsdom = new JSDOM(`
                <html>
                    <body>
                        <div cbr-dragndrop-no-pick></div>
                    </body>
                </html>
            `);

            global.document = jsdom.window.document;

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            const canPick = controller.canPick(jsdom.window.document.querySelector('div'));

            expect(canPick).toBeFalsy();
        });

        test('canPick pick enabled', () => {
            jsdom = new JSDOM(`
                <html>
                    <body>
                        <div></div>
                    </body>
                </html>
            `);

            global.document = jsdom.window.document;

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            const canPick = controller.canPick(jsdom.window.document.querySelector('div'));

            expect(canPick).toBeTruthy();
        });

    });

    describe('addToFreeArea', () => {
        test('addToFreeArea success', () => {
            jsdom = new JSDOM(`
                <html>
                    <body>
                    </body>
                </html>
            `);

            global.document = jsdom.window.document;

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const freeAreaElm = jsdom.window.document.createElement('div');
            const elm = jsdom.window.document.createElement('div');

            const controller = new CbrDraggableController(options);

            const resetElementPositionSpy = vi.spyOn(controller, 'resetElementPosition').mockImplementation(() => {});

            controller.addToFreeArea(elm, freeAreaElm);

            expect(freeAreaElm.children.length).toEqual(1);
            expect(resetElementPositionSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('resetElementPosition', () => {
        test('resetElementPosition success', () => {
            jsdom = new JSDOM(`
                <html>
                    <body>
                    </body>
                </html>
            `);

            global.document = jsdom.window.document;

            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const elm = jsdom.window.document.createElement('div');

            elm.style.left = '10px';
            elm.style.top = '10px';
            elm.style.position = 'fixed';

            const controller = new CbrDraggableController(options);

            controller.resetElementPosition(elm);

            expect(elm.style.left).toEqual('');
            expect(elm.style.top).toEqual('');
            expect(elm.style.position).toEqual('');
        });
    });

    describe('registerDraggable', () => {

        test('subject does not exist', () => {
            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            const draggable = new DraggableObject();

            controller.registerDraggable(draggable);

            const subject = controller.draggables_[draggableObjectId];
            expect(subject).not.toBeNull();
            expect(subject.getValue()).toEqual(draggable);
        });

        test('subject already exists', () => {
            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            const draggable = new DraggableObject();


            const subject = new DraggableBehaviorSubject(undefined);
            const nextSpy = vi.spyOn(subject, 'next').mockImplementation(() => {});

            controller.draggables_[draggableObjectId] = subject;

            controller.registerDraggable(draggable);

            expect(nextSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('getDraggableObserver', () => {

        test('subject already exists', () => {
            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);
            controller.draggables_[draggableObjectId] = new DraggableBehaviorSubject(undefined);

            const draggable = new DraggableObject();

            const observer = controller.getDraggableObserver(draggableObjectId);

            expect(observer).not.toBeNull();
        });

        test('subject does not exist', () => {
            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            const observer = controller.getDraggableObserver(draggableObjectId);

            expect(observer).not.toBeNull();
        });

    });

    describe('getDraggable', () => {

        test('draggable present', () => {
            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);
            const draggable = new DraggableObject();
            controller.draggables_[draggableObjectId] = new DraggableBehaviorSubject(draggable);

            const result = controller.getDraggable(draggableObjectId);

            expect(result).not.toBeNull();
        });

        test('draggable id not present', () => {
            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);

            expect(() => controller.getDraggable(draggableObjectId)).toThrowError();
        });

        test('draggable id present with undefined value', () => {
            const options: CbrDraggableControllerOptions = {
                pinAreaSelector: pinAreaSelector,
                freeAreaSelector: freeAreaSelector
            };

            const controller = new CbrDraggableController(options);
            controller.draggables_[draggableObjectId] = new DraggableBehaviorSubject(undefined);

            expect(() => controller.getDraggable(draggableObjectId)).toThrowError();
        });
    });
});

