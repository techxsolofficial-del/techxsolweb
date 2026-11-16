/**
 * TechXSol Visual HTML Page Designer - Core Canvas Engine
 * Manages canvas state, drag-and-drop, element selection, resize handles, inline text editing, and viewports.
 */

window.TechXDesigner = {
  canvas: null,
  frame: null,
  selectedElement: null,
  hoveredElement: null,
  dropIndicator: null,
  activeDropTarget: null,
  dropPosition: 'inside', // 'before' | 'after' | 'inside'
  currentViewport: 'desktop', // 'desktop' | 'tablet' | 'mobile'
  currentZoom: 1,
  idCounter: 100,

  init() {
    this.canvas = document.getElementById('canvasBody');
    this.frame = document.getElementById('canvasFrame');
    this.dropIndicator = document.getElementById('dropIndicator');

    if (!this.canvas) return;

    this.setupDragAndDrop();
    this.setupElementSelection();
    this.setupInlineEditing();
    this.setupViewportControls();
    this.setupZoomControls();
    this.setupKeyboardShortcuts();

    // Check if canvas has initial content or empty state
    this.updateEmptyState();
  },

  // Generate unique element id
  generateId(prefix = 'tx-el') {
    this.idCounter++;
    return `${prefix}-${Date.now().toString(36)}-${this.idCounter}`;
  },

  // --------------------------------------------------------------------------
  // DRAG AND DROP HANDLING
  // --------------------------------------------------------------------------
  setupDragAndDrop() {
    const canvasArea = document.getElementById('canvasArea');
    if (!canvasArea) return;

    // Canvas dragover: calculate drop position and indicator
    this.canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';

      const target = this.getClosestElement(e.target);
      if (!target || target === this.canvas) {
        // Drop at end of canvas
        this.dropPosition = 'inside';
        this.activeDropTarget = this.canvas;
        this.showDropIndicatorAtBottom();
        return;
      }

      const rect = target.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      const height = rect.height;

      const isContainer = target.tagName.toLowerCase() === 'section' || 
                          target.tagName.toLowerCase() === 'div' || 
                          target.tagName.toLowerCase() === 'form' || 
                          target.tagName.toLowerCase() === 'ul';

      if (isContainer && relY > height * 0.25 && relY < height * 0.75) {
        this.dropPosition = 'inside';
        this.activeDropTarget = target;
        this.showDropIndicatorInside(target);
      } else if (relY < height / 2) {
        this.dropPosition = 'before';
        this.activeDropTarget = target;
        this.showDropIndicatorLine(rect.left - canvasRect.left, rect.top - canvasRect.top, rect.width);
      } else {
        this.dropPosition = 'after';
        this.activeDropTarget = target;
        this.showDropIndicatorLine(rect.left - canvasRect.left, rect.bottom - canvasRect.top, rect.width);
      }
    });

    this.canvas.addEventListener('dragleave', (e) => {
      // Hide drop indicator when cursor leaves
      if (!this.canvas.contains(e.relatedTarget)) {
        this.hideDropIndicator();
      }
    });

    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      this.hideDropIndicator();

      const elementType = e.dataTransfer.getData('text/plain');
      if (!elementType) return;

      const elementDef = window.TechXElements ? window.TechXElements.findElement(elementType) : null;
      if (!elementDef) return;

      // Create new DOM element from template
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = elementDef.defaultHTML.trim();
      const newEl = tempDiv.firstElementChild;

      if (!newEl) return;

      if (!newEl.getAttribute('data-tx-id')) {
        newEl.setAttribute('data-tx-id', this.generateId(elementDef.type));
      }

      // Insert at calculated target
      if (!this.activeDropTarget || this.activeDropTarget === this.canvas) {
        this.canvas.appendChild(newEl);
      } else if (this.dropPosition === 'inside') {
        this.activeDropTarget.appendChild(newEl);
      } else if (this.dropPosition === 'before') {
        this.activeDropTarget.parentNode.insertBefore(newEl, this.activeDropTarget);
      } else if (this.dropPosition === 'after') {
        this.activeDropTarget.parentNode.insertBefore(newEl, this.activeDropTarget.nextSibling);
      }

      this.updateEmptyState();
      this.selectElement(newEl);

      // Record History
      if (window.TechXStorage) {
        window.TechXStorage.pushHistory('Add ' + elementDef.label);
      }

      if (window.TechXDesignerUI) {
        window.TechXDesignerUI.showToast(`Added ${elementDef.label} to canvas`, 'success');
      }
    });
  },

  showDropIndicatorLine(x, y, width) {
    if (!this.dropIndicator) return;
    this.dropIndicator.className = 'designer-drop-indicator';
    this.dropIndicator.style.display = 'block';
    this.dropIndicator.style.left = `${x}px`;
    this.dropIndicator.style.top = `${y}px`;
    this.dropIndicator.style.width = `${width}px`;
    this.dropIndicator.style.height = '3px';
  },

  showDropIndicatorInside(target) {
    if (!this.dropIndicator) return;
    const canvasRect = this.canvas.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    this.dropIndicator.className = 'designer-drop-indicator drop-inside';
    this.dropIndicator.style.display = 'block';
    this.dropIndicator.style.left = `${rect.left - canvasRect.left}px`;
    this.dropIndicator.style.top = `${rect.top - canvasRect.top}px`;
    this.dropIndicator.style.width = `${rect.width}px`;
    this.dropIndicator.style.height = `${rect.height}px`;
  },

  showDropIndicatorAtBottom() {
    if (!this.dropIndicator) return;
    const lastChild = this.canvas.lastElementChild;
    if (lastChild && !lastChild.classList.contains('canvas-empty-state')) {
      const rect = lastChild.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();
      this.showDropIndicatorLine(0, rect.bottom - canvasRect.top + 10, this.canvas.offsetWidth);
    } else {
      this.showDropIndicatorLine(20, 20, this.canvas.offsetWidth - 40);
    }
  },

  hideDropIndicator() {
    if (this.dropIndicator) {
      this.dropIndicator.style.display = 'none';
    }
  },

  getClosestElement(node) {
    if (!node || node === this.canvas) return null;
    let curr = node;
    while (curr && curr.parentNode && curr.parentNode !== this.canvas) {
      if (curr.classList && (curr.classList.contains('selection-action-bar') || curr.classList.contains('resize-handle'))) {
        return null;
      }
      curr = curr.parentNode;
    }
    return curr;
  },

  // --------------------------------------------------------------------------
  // ELEMENT SELECTION & OVERLAYS
  // --------------------------------------------------------------------------
  setupElementSelection() {
    this.canvas.addEventListener('click', (e) => {
      // If clicking inside action bar or handles, do not deselect
      if (e.target.closest('.selection-action-bar') || e.target.closest('.resize-handle')) {
        return;
      }

      // If clicking empty canvas area directly
      if (e.target === this.canvas) {
        this.deselect();
        return;
      }

      // Find direct child or nested target
      const target = e.target.closest('[data-tx-id]') || e.target;
      if (target && target !== this.canvas) {
        e.stopPropagation();
        this.selectElement(target);
      }
    });

    // Hover outline
    this.canvas.addEventListener('mouseover', (e) => {
      if (e.target === this.canvas || e.target.closest('.selection-action-bar') || e.target.closest('.resize-handle')) {
        return;
      }
      if (this.hoveredElement && this.hoveredElement !== e.target) {
        this.hoveredElement.classList.remove('designer-hovered');
      }
      this.hoveredElement = e.target;
      if (!this.hoveredElement.classList.contains('designer-selected')) {
        this.hoveredElement.classList.add('designer-hovered');
      }
    });

    this.canvas.addEventListener('mouseout', (e) => {
      if (this.hoveredElement) {
        this.hoveredElement.classList.remove('designer-hovered');
        this.hoveredElement = null;
      }
    });
  },

  selectElement(el) {
    if (!el || el === this.canvas) return;

    // Deselect previous
    this.deselect();

    this.selectedElement = el;
    el.classList.remove('designer-hovered');
    el.classList.add('designer-selected');

    if (!el.getAttribute('data-tx-id')) {
      el.setAttribute('data-tx-id', this.generateId(el.tagName.toLowerCase()));
    }

    // Attach floating action toolbar
    this.attachActionBar(el);

    // Attach 8 resize handles
    this.attachResizeHandles(el);

    // Update Properties & Animation panels
    if (window.TechXProperties) {
      window.TechXProperties.populate(el);
    }
    if (window.TechXAnimations) {
      window.TechXAnimations.populate(el);
    }
    if (window.TechXLayers) {
      window.TechXLayers.highlightNode(el);
    }
  },

  deselect() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove('designer-selected');
      this.removeOverlays(this.selectedElement);
      this.selectedElement = null;
    }
    if (window.TechXProperties) {
      window.TechXProperties.clear();
    }
    if (window.TechXAnimations) {
      window.TechXAnimations.clear();
    }
  },

  removeOverlays(el) {
    if (!el) return;
    const actionBar = el.querySelector(':scope > .selection-action-bar');
    if (actionBar) actionBar.remove();

    const handles = el.querySelectorAll(':scope > .resize-handle');
    handles.forEach(h => h.remove());
  },

  attachActionBar(el) {
    const existing = el.querySelector(':scope > .selection-action-bar');
    if (existing) existing.remove();

    const bar = document.createElement('div');
    bar.className = 'selection-action-bar';
    bar.contentEditable = 'false';

    const tag = el.tagName.toLowerCase();
    bar.innerHTML = `
      <span class="tag-label-pill">${tag}</span>
      <button class="action-bar-btn" title="Select Parent" data-action="parent"><i class="fa-solid fa-arrow-up"></i></button>
      <button class="action-bar-btn" title="Move Up" data-action="move-up"><i class="fa-solid fa-chevron-up"></i></button>
      <button class="action-bar-btn" title="Move Down" data-action="move-down"><i class="fa-solid fa-chevron-down"></i></button>
      <button class="action-bar-btn" title="Duplicate Element" data-action="duplicate"><i class="fa-solid fa-clone"></i></button>
      <button class="action-bar-btn btn-delete" title="Delete Element" data-action="delete"><i class="fa-solid fa-trash-can"></i></button>
    `;

    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = e.target.closest('.action-bar-btn');
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      this.handleAction(action, el);
    });

    el.appendChild(bar);
  },

  attachResizeHandles(el) {
    const dirs = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    dirs.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `resize-handle ${dir}`;
      handle.contentEditable = 'false';
      this.setupResizeLogic(handle, el, dir);
      el.appendChild(handle);
    });
  },

  setupResizeLogic(handle, el, dir) {
    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = el.offsetWidth;
      const startHeight = el.offsetHeight;

      const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        if (dir.includes('e')) {
          el.style.width = `${Math.max(20, startWidth + deltaX)}px`;
        }
        if (dir.includes('w')) {
          el.style.width = `${Math.max(20, startWidth - deltaX)}px`;
        }
        if (dir.includes('s')) {
          el.style.height = `${Math.max(20, startHeight + deltaY)}px`;
        }
        if (dir.includes('n')) {
          el.style.height = `${Math.max(20, startHeight - deltaY)}px`;
        }

        // Live update dimensions in properties panel
        if (window.TechXProperties) {
          window.TechXProperties.updateDimensions(el);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        if (window.TechXStorage) {
          window.TechXStorage.pushHistory('Resize Element');
        }
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  },

  handleAction(action, el) {
    if (!el) return;

    switch (action) {
      case 'parent':
        if (el.parentElement && el.parentElement !== this.canvas) {
          this.selectElement(el.parentElement);
        }
        break;

      case 'move-up':
        if (el.previousElementSibling && !el.previousElementSibling.classList.contains('canvas-empty-state')) {
          el.parentNode.insertBefore(el, el.previousElementSibling);
          this.selectElement(el);
          if (window.TechXStorage) window.TechXStorage.pushHistory('Move Up');
        }
        break;

      case 'move-down':
        if (el.nextElementSibling) {
          el.parentNode.insertBefore(el.nextElementSibling, el);
          this.selectElement(el);
          if (window.TechXStorage) window.TechXStorage.pushHistory('Move Down');
        }
        break;

      case 'duplicate':
        this.removeOverlays(el);
        const clone = el.cloneNode(true);
        clone.setAttribute('data-tx-id', this.generateId(el.tagName.toLowerCase()));
        el.parentNode.insertBefore(clone, el.nextSibling);
        this.selectElement(clone);
        if (window.TechXStorage) window.TechXStorage.pushHistory('Duplicate Element');
        if (window.TechXDesignerUI) window.TechXDesignerUI.showToast('Element duplicated', 'info');
        break;

      case 'delete':
        this.deselect();
        el.remove();
        this.updateEmptyState();
        if (window.TechXStorage) window.TechXStorage.pushHistory('Delete Element');
        if (window.TechXDesignerUI) window.TechXDesignerUI.showToast('Element deleted', 'warning');
        break;
    }
  },

  // --------------------------------------------------------------------------
  // INLINE TEXT DIRECT EDITING
  // --------------------------------------------------------------------------
  setupInlineEditing() {
    this.canvas.addEventListener('dblclick', (e) => {
      const el = e.target;
      if (!el || el === this.canvas || el.closest('.selection-action-bar') || el.closest('.resize-handle')) {
        return;
      }

      // Check if text element or contains direct text
      const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'li', 'th', 'td'];
      if (allowedTags.includes(el.tagName.toLowerCase())) {
        e.stopPropagation();
        el.contentEditable = 'true';
        el.focus();
        el.style.outline = '2px solid #00C8FF';

        const finishEditing = () => {
          el.contentEditable = 'false';
          el.style.outline = '';
          el.removeEventListener('blur', finishEditing);
          el.removeEventListener('keydown', handleKey);
          if (window.TechXStorage) {
            window.TechXStorage.pushHistory('Edit Text');
          }
          if (window.TechXProperties && window.TechXDesigner.selectedElement === el) {
            window.TechXProperties.populate(el);
          }
        };

        const handleKey = (evt) => {
          if (evt.key === 'Enter' && !evt.shiftKey && el.tagName.toLowerCase() !== 'p') {
            evt.preventDefault();
            el.blur();
          }
        };

        el.addEventListener('blur', finishEditing);
        el.addEventListener('keydown', handleKey);
      }
    });
  },

  // --------------------------------------------------------------------------
  // VIEWPORT CONTROLS
  // --------------------------------------------------------------------------
  setupViewportControls() {
    const btns = document.querySelectorAll('.device-btn');
    const badge = document.getElementById('canvasDimensionBadge');

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const device = btn.getAttribute('data-device');
        this.setViewport(device);

        if (badge) {
          const dims = {
            desktop: '1200px × Responsive Desktop',
            tablet: '768px × iPad / Tablet Portrait',
            mobile: '375px × iPhone / Mobile Portrait'
          };
          badge.textContent = dims[device] || 'Desktop';
        }
      });
    });
  },

  setViewport(device) {
    if (!this.frame) return;
    this.currentViewport = device;
    this.frame.classList.remove('viewport-desktop', 'viewport-tablet', 'viewport-mobile');
    this.frame.classList.add(`viewport-${device}`);
  },

  // --------------------------------------------------------------------------
  // ZOOM CONTROLS
  // --------------------------------------------------------------------------
  setupZoomControls() {
    const zoomSelect = document.getElementById('canvasZoomSelect');
    if (!zoomSelect) return;

    zoomSelect.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      this.setZoom(val);
    });
  },

  setZoom(scale) {
    if (!this.frame) return;
    this.currentZoom = scale;
    this.frame.style.transform = `scale(${scale})`;
    this.frame.style.transformOrigin = 'top center';
  },

  // --------------------------------------------------------------------------
  // KEYBOARD SHORTCUTS
  // --------------------------------------------------------------------------
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing inside an input/textarea or code editor
      if (['input', 'textarea'].includes(e.target.tagName.toLowerCase()) || e.target.isContentEditable) {
        return;
      }

      // Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedElement) {
        e.preventDefault();
        this.handleAction('delete', this.selectedElement);
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && this.selectedElement) {
        e.preventDefault();
        this.handleAction('duplicate', this.selectedElement);
      }

      // Escape: Deselect
      if (e.key === 'Escape') {
        this.deselect();
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (window.TechXStorage) window.TechXStorage.undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        if (window.TechXStorage) window.TechXStorage.redo();
      }
    });
  },

  // Check if canvas is empty to show helpful placeholder
  updateEmptyState() {
    if (!this.canvas) return;
    const hasElements = Array.from(this.canvas.children).some(
      child => !child.classList.contains('canvas-empty-state') && 
               !child.classList.contains('designer-drop-indicator')
    );

    let emptyState = this.canvas.querySelector('.canvas-empty-state');
    if (!hasElements) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'canvas-empty-state';
        emptyState.innerHTML = `
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <h4>Start Designing Your HTML Page</h4>
          <p>Drag elements from the left sidebar and drop them here, or click "Import HTML" in the topbar.</p>
        `;
        this.canvas.appendChild(emptyState);
      }
      emptyState.style.display = 'flex';
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }

    if (window.TechXLayers) {
      window.TechXLayers.refresh();
    }
  }
};

