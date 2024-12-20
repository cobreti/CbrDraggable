/**
  * Draggable component
  *
  * @requires vuejs v3.5.5
  * @slot default
  * @prop {string} dropAreaClass - class name of drop area
  *
  * use special attribut 'cbr-dragndrop-no-pick' to prevent a child element from starting a drag operation
  *
  */

<template>
  <div class="draggable-content" @mousedown="onMouseDown" @touchstart="onTouchStart" ref="draggableContent">
    <slot>
    </slot>
  </div>
</template>

<style scoped>
  .draggable-content {
    display: inline-block;
  }

  .add-icon {
    display: inline-block;
    transform: translate3d(-50%, -50%, 0);
    font-size: larger;
    font-weight: bolder;
  }

  .remove-icon {
    display: inline-block;
    font-size: larger;
    font-weight: bolder;
  }
</style>

<script setup lang="ts">

  import { computed, onMounted, type Ref, ref, type ShallowRef, useTemplateRef } from 'vue'
  import {
    type CbrDraggableState,
    CbrDraggableStateEnum,
    type CbrHoverEnterEvent,
    type CbrHoverEnterDelegate,
    type CbrHoverExitEvent,
    type CbrPinEvent,
    type CbrUnpinnedEvent
  } from './cbrDragNDropTypes'
  import type { CbrDraggableControllerInterface } from './cbrDraggableController';
  import type { CbrDraggableInterface } from './cbrDraggableInterface';

  const draggedElm: Ref<HTMLElement | null> = ref(null)
  const freeArea : Ref<Element | null> = ref(null);
  const draggableRef: ShallowRef<HTMLElement | null | undefined> = useTemplateRef('draggableContent');
  const orgPosition: Ref<string> = ref('');
  const state: Ref<CbrDraggableState> = ref({
    state: CbrDraggableStateEnum.FREE
  });

  const showAddIcon : Ref<boolean> = computed(() => {
    return state.value?.hoverArea != undefined;
  });

  const showRemoveIcon: Ref<boolean> = computed(() => {
    return state.value?.pinArea != undefined && state.value?.state != 'dragging';
  });

  const props = defineProps<{
    id: string,
    controller?: CbrDraggableControllerInterface,
    hoverEnter?: CbrHoverEnterDelegate,
    hoverExit?: (event: CbrHoverExitEvent) => void,
    stateChanged?: (state: CbrDraggableState) => void
  }>()


  class DraggableObject implements CbrDraggableInterface {
    get id(): string { return props.id}

    get showAddIcon(): Ref<boolean> { return showAddIcon }
    get showRemoveIcon(): Ref<boolean> { return showRemoveIcon }

    unpin() {
      if (!draggedElm.value) {
        return
      }

      if (state.value.pinArea) {
        const unpinEvent : CbrUnpinnedEvent = {
          element: draggedElm.value,
          pinArea: state.value.pinArea!
        }

        props.controller?.onUnpin(this, unpinEvent);
      }

      addToFreeArea();
      setState({
        state: CbrDraggableStateEnum.FREE
      });

      draggedElm.value.style.left  = "";
      draggedElm.value.style.top  = "";
      draggedElm.value.style.position = orgPosition.value;
    }

    pin(pinArea: HTMLElement) {
      if (!draggedElm.value) {
        return
      }

      if (state.value.hoverArea != state.value.pinArea) {
        const unpinEvent : CbrUnpinnedEvent = {
          element: draggedElm.value,
          pinArea: state.value.pinArea!
        }

        props.controller?.onUnpin(draggableObject, unpinEvent);
      }

      const pinEvent: CbrPinEvent = {
        draggableElement: draggedElm.value,
        pinArea
      };

      props.controller?.onPin(this, pinEvent);

      draggedElm.value.style.left  = "";
      draggedElm.value.style.top  = "";
      draggedElm.value.style.position = orgPosition.value;

      setState({
        state: CbrDraggableStateEnum.PINNED,
        pinArea: pinArea
      });
    }
  };
  
  const draggableObject : CbrDraggableInterface = new DraggableObject();


  /**
   * Mounted hook
   */
  onMounted(() => {
    console.log('CbrDraggable mounted');

    freeArea.value = props.controller?.freeAreaElement;
    draggedElm.value = draggableRef.value as HTMLElement;
    orgPosition.value = draggedElm.value.style.position;

    props.controller?.registerDraggable(draggableObject);

    if (props.stateChanged) {
      props.stateChanged(state.value);
    }
  });

  /**
   * set the state of the draggable element
   * @param newState : state to set
   */
  function setState(newState: CbrDraggableState) {
    state.value = newState;
    if (props.stateChanged) {
      props.stateChanged(state.value);
    }
  }

  /**
   * return the pin element where the draggable can be pinnedfrom a point
   * @param x 
   * @param y 
   */
  function getPinAreaFromPoint(x: number, y: number): Element | undefined {
    return props.controller?.getPinAreaFromPoint(x, y);
  }


  /**
   * on drag start event handler
   *  called by mouse down or touch start event
   */
  function onDragStart() {
    if (!draggableRef.value)
      return;

    if (!draggedElm.value)
      return;

    orgPosition.value = draggedElm.value.style.position
    draggedElm.value.style.position = 'fixed'
    setState({
      state: CbrDraggableStateEnum.DRAGGING,
      hoverArea: state.value.pinArea,
      pinArea: state.value.pinArea
    });
  }

  function createNext<T>(delegate?: (value: T) => void): (nextValue: T) => void {
    return (value: T) => {
      if (delegate) {
        delegate(value);
      }
    }
  }

  /**
   * on drag move event handler
   *  called by mouse move or touch move event
   * 
   * @param clientX 
   * @param clientY 
   */
  function onDragMove(clientX: number, clientY: number) {
    if (!draggedElm.value) {
      return
    }

    draggedElm.value.style.left = `${clientX - draggedElm.value.clientWidth / 2}px`
    draggedElm.value.style.top = `${clientY - draggedElm.value.clientHeight / 2}px`

    let dropArea = getPinAreaFromPoint(clientX, clientY)

    if (dropArea !== state.value.hoverArea) {
      if (dropArea) {
        const hoverEnterEvent : CbrHoverEnterEvent = {
          element: draggedElm.value,
          dropArea: dropArea,
          dropPrevented: false,
          preventDrop: () => {
            hoverEnterEvent.dropPrevented = true;
          }
        };

        props.controller?.onHoverEnter(draggableObject, hoverEnterEvent, createNext(props.hoverEnter));

        if (hoverEnterEvent.dropPrevented) {
          console.log('drop prevented');
          dropArea = undefined;
        }
      }
      else {
        const hoverExitEvent : CbrHoverExitEvent = {
          element: draggedElm.value,
          dropArea: state.value.hoverArea
        };

        props.controller?.onHoverExit(draggableObject, hoverExitEvent, createNext(props.hoverExit));
      }

      setState({
        state: CbrDraggableStateEnum.DRAGGING,
        hoverArea: dropArea,
        pinArea: state.value.pinArea
      });
    }
  }

  /**
   * on drag end event handler
   *  called by mouse up or touch end event
   */
  function onDragEnd() {
    if (!draggedElm.value) {
      return
    }

    if (state.value.hoverArea && draggedElm.value) {
      draggableObject.pin(state.value.hoverArea as HTMLElement);
    }
    else {
      draggableObject.unpin();
    }

    draggedElm.value.style.position = orgPosition.value;
  }

  /**
   * on drag canceled event handler
   *  called when the touch is canceled by the user
   */
  function onDragCanceled() {
    if (!draggedElm.value) {
      return
    }

    addToFreeArea();

    setState({
      state: CbrDraggableStateEnum.FREE
    });

    draggedElm.value = null;
  }

  /**
   * touch move event handler
   * @param event 
   */
  function onTouchMove(event: TouchEvent) {
    event.preventDefault();

    onDragMove(event.touches[0].clientX, event.touches[0].clientY);
  }

  /**
   * mouse move event handler
   * @param event 
   */
  function onMouseMove(event: MouseEvent) {
    event.preventDefault();

    onDragMove(event.clientX, event.clientY);
  }

  /**
   * mouse up event handler
   * @param event 
   */
  function onMouseUp(event: MouseEvent) {
    event.preventDefault()

    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)

    onDragEnd();
  }

  /**
   * touch end event handler
   * @param event 
   */
  function onTouchEnd(event: TouchEvent) {
    event.preventDefault();

    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchCancel);

    onDragEnd();
  }

  /**
   * touch cancel event handler
   * @param event 
   */
  function onTouchCancel(event: TouchEvent) {
    event.preventDefault();

    onDragCanceled();

    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchCancel);
  }

  /**
   * mouse down event handler
   * @param event 
   */
  function onMouseDown(event: MouseEvent) {
    if (!props.controller?.canPick(event.target as HTMLElement)) {
      return;
    }

    event.preventDefault()

    onDragStart();

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  /**
   * touch start event handler
   * @param event 
   */
  function onTouchStart(event: TouchEvent) {
    event.preventDefault();

    onDragStart();

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchCancel);
  }

  /**
   * add the draggable element to the free area element
   */
  function addToFreeArea() {

    if (!freeArea.value)
      return;

    if (!draggedElm.value)
      return;

    if (!props.controller) {
      return;
    }

    let freeAreaParent = draggedElm.value.closest(props.controller.freeAreaSelector);

    if (!freeAreaParent) {
      props.controller.addToFreeArea(draggedElm.value, freeArea.value as HTMLElement);
    }
  }

</script>
