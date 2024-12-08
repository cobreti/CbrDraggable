import { afterEach, describe, expect, test, vi } from 'vitest';
import { CbrDraggableController, CbrDraggableControllerOptions } from './cbrDraggableController.ts';

describe('construction', () => {

    const pinAreaSelector = '.pin-area';
    const freeAreaSelector = '.free-area';

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