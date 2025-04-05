import { BehaviorSubject, Observable } from "rxjs";
import type { CbrDraggableInterface } from "./cbrDraggableInterface.ts";


export interface CbrDraggableControllerInterface {

    pinAreaElement: HTMLElement;
    freeAreaElement: HTMLElement | null;
    freeAreaSelector: string;
    draggableSelector: string;

    getDropAreaFromPoint(x: number, y: number): HTMLElement | undefined;

    /**
     * return if the given element can be used to start a drag operation
     * 
     * @param elm: HTMLElement
     * @returns true if the element can be used to start a drag operation, false otherwise
     */
    canPick(elm: HTMLElement): boolean;

    addToFreeArea(elm: HTMLElement, freeArea: HTMLElement): void;

    resetElementPosition(elm: HTMLElement): void;

    registerDraggable(draggable: CbrDraggableInterface): void;
    getDraggable(id: string): CbrDraggableInterface;
    getDraggableObserver(id: string): Observable<CbrDraggableInterface | undefined>;
}


export type CbrDraggableControllerOptions = {
    pinAreaSelector: string;
    freeAreaSelector: string;
    draggableSelector?: string;
}

export class DraggableBehaviorSubject extends BehaviorSubject<CbrDraggableInterface | undefined> {}

type DraggablesTable = {[key: string]: DraggableBehaviorSubject};

export class CbrDraggableController implements CbrDraggableControllerInterface {

    pinAreaSelector_: string;
    freeAreaSelector_: string;
    draggableSelector_: string;
    draggables_: DraggablesTable = {};

    constructor(options: CbrDraggableControllerOptions) {
        this.pinAreaSelector_ = options.pinAreaSelector;
        this.freeAreaSelector_ = options.freeAreaSelector;
        this.draggableSelector_ = options.draggableSelector || '.cbr-draggable-item-root';
    }

    get pinAreaElement(): HTMLElement {
        return document.querySelector(this.pinAreaSelector_) as HTMLElement;
    }

    get pinAreaSelector(): string {
        return this.pinAreaSelector_;
    }

    get freeAreaSelector(): string {
        return this.freeAreaSelector_;
    }

    get draggableSelector(): string {
        return this.draggableSelector_;
    }

    get freeAreaElement(): HTMLElement | null {
        return document.querySelector(this.freeAreaSelector_) as HTMLElement;
    }

    getDropAreaFromPoint(x: number, y: number): HTMLElement | undefined {
        if (this.pinAreaSelector_ === '') {
          return undefined
        }
    
        let elements: Element[] | null = null
        let dropArea : HTMLElement | undefined = undefined;
    
        elements = document.elementsFromPoint(x, y);

        dropArea = elements.find((element) => {
            return element.matches(this.pinAreaSelector_);
        }) as HTMLElement;
    
        return dropArea;
    }

    canPick(elm: HTMLElement): boolean {
        return !(elm && elm.hasAttribute('cbr-dragndrop-no-pick'));
    }

    addToFreeArea(elm: HTMLElement, freeArea: HTMLElement): void {
        freeArea.appendChild(elm);
        this.resetElementPosition(elm);
    }

    resetElementPosition(elm: HTMLElement): void {
        elm.style.left  = "";
        elm.style.top  = "";
        elm.style.position = '';
    }

    registerDraggable(draggable: CbrDraggableInterface): void {
        const id = draggable.id;
        if (id in this.draggables_) {
            this.draggables_[id].next(draggable);
        }
        else {
            this.draggables_[id] = new DraggableBehaviorSubject(draggable);
        }
    }

    getDraggableObserver(id: string): Observable<CbrDraggableInterface | undefined> {
        if (!(id in this.draggables_)) {
            this.draggables_[id] = new DraggableBehaviorSubject(undefined);
        }

        return this.draggables_[id];
    }

    getDraggable(id: string): CbrDraggableInterface {
        if (!(id in this.draggables_)) {
            throw new Error(`Draggable with id ${id} not found`);
        }

        const value = this.draggables_[id].getValue();
        if (!value) {
            throw new Error(`Draggable with id ${id} not found`);
        }
        
        return value;
    }
}
