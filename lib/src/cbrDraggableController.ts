import { BehaviorSubject, Observable } from "rxjs";
import type { CbrDraggableInterface } from "./cbrDraggableInterface.ts";
import type { CbrDraggableState, CbrHoverEnterDelegate, CbrHoverEnterEvent, CbrHoverExitDelegate, CbrHoverExitEvent, CbrPinEvent, CbrUnpinnedEvent } from "./cbrDragNDropTypes.ts";


export interface CbrDraggableEventsInterface {

    onHoverEnter(draggable: CbrDraggableInterface, event: CbrHoverEnterEvent): void;
    onHoverExit(draggable: CbrDraggableInterface, event: CbrHoverExitEvent): void
    onPin(draggable: CbrDraggableInterface, event: CbrPinEvent): void;
    onUnpin(draggable: CbrDraggableInterface, event: CbrUnpinnedEvent): void;
    onStateChanged(draggable: CbrDraggableInterface, state: CbrDraggableState): void;
}


export interface CbrDraggableControllerInterface {

    pinAreaElement: HTMLElement;
    freeAreaElement: HTMLElement | null;
    freeAreaSelector: string;

    getPinAreaFromPoint(x: number, y: number): Element | undefined;

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
}

type DraggablesTable = {[key: string]: BehaviorSubject<CbrDraggableInterface | undefined>};

export class CbrDraggableController implements CbrDraggableControllerInterface {

    pinAreaSelector_: string;
    freeAreaSelector_: string;
    draggables_: DraggablesTable = {};

    constructor(options: CbrDraggableControllerOptions) {
        this.pinAreaSelector_ = options.pinAreaSelector;
        this.freeAreaSelector_ = options.freeAreaSelector;
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

    get freeAreaElement(): HTMLElement | null {
        return document.querySelector(this.freeAreaSelector_) as HTMLElement;
    }

    getPinAreaFromPoint(x: number, y: number): Element | undefined {
        if (this.pinAreaSelector_ === '') {
          return undefined
        }
    
        let elements: Element[] | null = null
        let dropArea : Element | undefined = undefined;
    
        elements = document.elementsFromPoint(x, y);

        dropArea = elements.find((element) => {
            return element.matches(this.pinAreaSelector_)
        })
    
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
            this.draggables_[id] = new BehaviorSubject<CbrDraggableInterface | undefined>(draggable);
        }
    }

    getDraggableObserver(id: string): Observable<CbrDraggableInterface | undefined> {
        if (!(id in this.draggables_)) {
            this.draggables_[id] = new BehaviorSubject<CbrDraggableInterface | undefined>(undefined);
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
