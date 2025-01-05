import {ref, Ref, useTemplateRef} from 'vue';
import type {CbrDraggableEventsListenerInterface, CbrDraggableInterface} from '@/cbrDraggableInterface.js';
import {
    CbrDraggableProps,
    CbrDraggableState,
    CbrDraggableStateEnum, CbrHoverEnterEvent, CbrHoverExitEvent,
    CbrPinEvent,
    CbrUnpinnedEvent
} from '@/cbrDragNDropTypes.js';
import {CbrDraggableControllerInterface} from '@/cbrDraggableController.js';

export type EventListenersInterfacesTable = Set<CbrDraggableEventsListenerInterface>;

export class ExternalStateSet extends Map<string, any> {}

export class DraggableEngine implements CbrDraggableInterface {

    readonly eventListeners_: EventListenersInterfacesTable = new Set();

    readonly state_: Ref<CbrDraggableState> = ref({
        state: CbrDraggableStateEnum.FREE
    });

    readonly externalStates_: ExternalStateSet = new ExternalStateSet();

    readonly draggedElm_ : Ref<HTMLElement | null> = ref(null);

    readonly freeArea_ : Ref<HTMLElement | null> = ref(null);

    readonly draggableRef_ : Ref<HTMLElement | null> = ref(null);

    readonly orgPosition_ : Ref<string> = ref('');

    readonly orgParent_ : Ref<HTMLElement | null> = ref(null);

    constructor(private readonly props_: CbrDraggableProps, divRefName = 'draggableContent') {
        this.draggableRef_ = useTemplateRef(divRefName);
    }

    get props(): CbrDraggableProps { return this.props_ }
    get id(): string { return this.props.id}

    get state(): Ref<CbrDraggableState> { return this.state_ }

    get draggedElm() : Ref<HTMLElement | null> { return this.draggedElm_ }
    get freeArea() : Ref<HTMLElement | null> { return this.freeArea_ }
    get draggableRef() : Ref<HTMLElement | null> { return this.draggableRef_ }
    get orgPosition() : Ref<string> { return this.orgPosition_ }

    get pinArea(): HTMLElement | null { return this.state.value.pinArea }
    get hoverArea(): HTMLElement | null { return this.state.value.hoverArea }
    get element(): HTMLElement { return this.draggedElm.value }
    get controller(): CbrDraggableControllerInterface | null { return this.props_.controller }

    unpin() {
        if (!this.draggedElm.value) {
            return
        }

        if (this.state.value.pinArea) {
            const unpinEvent : CbrUnpinnedEvent = {
                element: this.draggedElm.value,
                pinArea: this.state.value.pinArea!
            }

            this.forEachListener((eventListener) => {
                eventListener.onUnpin(this, unpinEvent);
            });
        }

        this.addToFreeArea();
        this.setState({
            state: CbrDraggableStateEnum.FREE
        });

        this.draggedElm.value.style.left  = "";
        this.draggedElm.value.style.top  = "";
        this.draggedElm.value.style.position = this.orgPosition.value;
    }

    pin(pinArea: HTMLElement) {
        if (!this.draggedElm.value) {
            return
        }

        if (this.state.value.hoverArea != this.state.value.pinArea) {
            const unpinEvent : CbrUnpinnedEvent = {
                element: this.draggedElm.value,
                pinArea: this.state.value.pinArea!
            }

            this.forEachListener((eventListener) => {
                eventListener.onUnpin(this, unpinEvent);
            });
        }


        const pinEvent: CbrPinEvent = {
            draggableElement: this.draggedElm.value,
            pinArea
        };

        this.forEachListener((eventListener) => {
            eventListener.onPin(this, pinEvent);
        });

        pinArea.appendChild(this.draggedElm.value);

        this.draggedElm.value.style.left  = "";
        this.draggedElm.value.style.top  = "";
        this.draggedElm.value.style.position = this.orgPosition.value;

        if (pinArea == this.props.controller.freeAreaElement) {
            this.setState({
                state: CbrDraggableStateEnum.FREE
            });
        } else {
            this.setState({
                state: CbrDraggableStateEnum.PINNED,
                pinArea: pinArea
            });
        }
    }

    /**
     * set the state of the draggable element
     * @param newState : state to set
     */
    setState(newState: CbrDraggableState) {
        this.state_.value = newState;

        this.forEachListener((eventListener) => {
            eventListener.onStateChanged(this, this.state.value);
        });
    }

    updateExternalState(externalState: string, value: any) {
        const oldValue = this.externalStates_.get(externalState);
        this.externalStates_.set(externalState, value);

        this.forEachListener((eventListener) => {
            eventListener.onExternalStateChanged(this, externalState, oldValue, value);
        });
    }

    getExternalState(externalState: string): any {
        return this.externalStates_.get(externalState);
    }

    addEventListener(eventListener: CbrDraggableEventsListenerInterface) {
        this.eventListeners_.add(eventListener);
    }

    removeEventListener(eventListener: CbrDraggableEventsListenerInterface) {
        this.eventListeners_.delete(eventListener);
    }

    forEachListener(callback: (eventListener: CbrDraggableEventsListenerInterface) => void) {
        this.eventListeners_.forEach(callback);
    }

    /**
     * return the pin element where the draggable can be pinnedfrom a point
     * @param x
     * @param y
     */
    getDropAreaFromPoint(x: number, y: number): HTMLElement | undefined {
        return this.props.controller.getDropAreaFromPoint(x, y);
    }

    onMounted() {
        this.freeArea.value = this.props.controller.freeAreaElement;
        this.draggedElm.value = this.draggableRef.value as HTMLElement;
        this.orgPosition.value = this.draggedElm.value.style.position;

        this.props.controller?.registerDraggable(this);

        this.forEachListener((eventListener) => {
            eventListener.onStateChanged(this, this.state.value);
        });
    }

    /**
     * on drag start event handler
     *  called by mouse down or touch start event
     */
    onDragStart(clientX: number, clientY: number) {
        if (!this.draggableRef.value)
            return;

        if (!this.draggedElm.value)
            return;

        this.forEachListener((listener) => listener.onDragStart(this));


        this.orgPosition.value = this.draggedElm.value.style.position
        this.draggedElm.value.style.position = 'fixed'
        this.draggedElm.value.style.left = `${clientX - this.draggedElm.value.clientWidth / 2}px`;
        this.draggedElm.value.style.top = `${clientY - this.draggedElm.value.clientHeight / 2}px`;
        this.orgParent_.value = this.draggedElm.value.parentElement;
        document.body.appendChild(this.draggedElm.value);
        this.setState({
            state: CbrDraggableStateEnum.DRAGGING,
            hoverArea: this.state.value.pinArea,
            pinArea: this.state.value.pinArea
        });
    }

    /**
     * on drag move event handler
     *  called by mouse move or touch move event
     *
     * @param clientX
     * @param clientY
     */
    onDragMove(clientX: number, clientY: number) {
        if (!this.draggedElm.value) {
            return
        }

        this.draggedElm.value.style.left = `${clientX - this.draggedElm.value.clientWidth / 2}px`;
        this.draggedElm.value.style.top = `${clientY - this.draggedElm.value.clientHeight / 2}px`;

        let dropArea = this.getDropAreaFromPoint(clientX, clientY)

        if (dropArea !== this.state.value.hoverArea) {
            if (dropArea) {
                const hoverEnterEvent : CbrHoverEnterEvent = {
                    element: this.draggedElm.value,
                    dropArea: dropArea,
                    dropPrevented: false,
                    preventDrop: () => {
                        hoverEnterEvent.dropPrevented = true;
                    }
                };

                this.forEachListener((eventListener) => {
                    eventListener.onHoverEnter(this, hoverEnterEvent);
                });

                if (hoverEnterEvent.dropPrevented) {
                    console.log('drop prevented');
                    dropArea = undefined;
                }
            }
            else {
                const hoverExitEvent : CbrHoverExitEvent = {
                    element: this.draggedElm.value,
                    dropArea: this.state.value.hoverArea
                };

                this.forEachListener((eventListener) => {
                    eventListener.onHoverExit(this, hoverExitEvent);
                });
            }

            this.setState({
                state: CbrDraggableStateEnum.DRAGGING,
                hoverArea: dropArea,
                pinArea: this.state.value.pinArea
            });
        }
    }

    /**
     * on drag end event handler
     *  called by mouse up or touch end event
     */
    onDragEnd() {
        if (!this.draggedElm.value) {
            return
        }

        this.forEachListener((listener) => listener.onDragEnd(this));

        if (this.state.value.hoverArea && this.draggedElm.value) {
            this.pin(this.state.value.hoverArea as HTMLElement);
        }
        else {
            console.log('draggable not over a drop area');
            this.orgParent_.value.appendChild(this.draggedElm.value);
            this.orgParent_.value = null;
            this.props.controller?.resetElementPosition(this.draggedElm.value);
        }

        this.draggedElm.value.style.position = this.orgPosition.value;
    }

    /**
     * on drag canceled event handler
     *  called when the touch is canceled by the user
     */
    onDragCanceled() {
        if (!this.draggedElm.value) {
            return
        }

        this.addToFreeArea();

        this.setState({
            state: CbrDraggableStateEnum.FREE
        });

        this.draggedElm.value = null;
    }

    /**
     * touch move event handler
     * @param event
     */
    onTouchMove(event: TouchEvent) {
        event.preventDefault();

        this.onDragMove(event.touches[0].clientX, event.touches[0].clientY);
    }

    /**
     * mouse move event handler
     * @param event
     */
    onMouseMove(event: MouseEvent) {
        event.preventDefault();

        this.onDragMove(event.clientX, event.clientY);
    }

    /**
     * mouse up event handler
     * @param event
     */
    onMouseUp(event: MouseEvent) {
        event.preventDefault()

        this.onDragEnd();
    }

    /**
     * touch end event handler
     * @param event
     */
    onTouchEnd(event: TouchEvent) {
        event.preventDefault();

        this.onDragEnd();
    }

    /**
     * touch cancel event handler
     * @param event
     */
    onTouchCancel(event: TouchEvent) {
        event.preventDefault();

        this.onDragCanceled();
    }

    /**
     * mouse down event handler
     * @param event
     */
    onMouseDown(event: MouseEvent): boolean {
        const elm = event.target as HTMLElement;

        if (!elm) {
            return false;
        }

        const draggableElm = elm.closest('.draggable-item');
        if (!draggableElm) {
            return false;
        }

        if (!this.props.controller?.canPick(event.target as HTMLElement)) {
            return false;
        }

        event.preventDefault()

        this.onDragStart(event.clientX, event.clientY);

        return true;
    }

    /**
     * touch start event handler
     * @param event
     */
    onTouchStart(event: TouchEvent) : boolean {
        const elm = event.target as HTMLElement;

        if (!elm) {
            return false;
        }

        const draggableElm = elm.closest('.draggable-item');
        if (!draggableElm) {
            return false;
        }

        if (!this.props.controller?.canPick(event.target as HTMLElement)) {
            return false;
        }

        event.preventDefault();

        this.onDragStart(event.touches[0].clientX, event.touches[0].clientY);

        return true;
    }

    /**
     * add the draggable element to the free area element
     */
    addToFreeArea() {

        if (!this.freeArea.value)
            return;

        if (!this.draggedElm.value)
            return;

        if (!this.props.controller) {
            return;
        }

        let freeAreaParent = this.draggedElm.value.closest(this.props.controller.freeAreaSelector);

        if (!freeAreaParent) {
            this.props.controller.addToFreeArea(this.draggedElm.value, this.freeArea.value as HTMLElement);
        }
    }

}
