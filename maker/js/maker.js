document.addEventListener('DOMContentLoaded', () => {
    // --- Phase 1: Top Bar Interactions ---
    const titleInput = document.getElementById('article-title-input');
    titleInput.addEventListener('focus', () => titleInput.select());
    titleInput.addEventListener('blur', () => {
        if (!titleInput.value.trim()) titleInput.value = 'ENTER_TITLE_HERE';
    });

    function compressImage(file, maxWidth, maxHeight, quality, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            if (file.type === 'image/gif' || file.name && file.name.toLowerCase().endsWith('.gif')) {
                callback(e.target.result);
                return;
            }
            const img = new Image();
            img.onload = function() {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                callback(dataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function cropHeaderImage(base64, yOffsetPercent) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const targetWidth = Math.min(img.width, 3840);
                const targetHeight = targetWidth / 5;
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                const scale = targetWidth / img.width;
                const scaledHeight = img.height * scale;
                const maxDy = targetHeight - scaledHeight;
                let dy = 0;
                if (maxDy < 0) {
                    dy = maxDy * (yOffsetPercent / 100);
                }
                ctx.drawImage(img, 0, dy, targetWidth, scaledHeight);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = base64;
        });
    }

    document.addEventListener('focusin', (e) => {
        if (e.target.matches('.module-title, .table-rows strong, .table-rows span, .table-rows div')) {
            const range = document.createRange();
            range.selectNodeContents(e.target);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });

    // Modals logic
    function openModal(id) {
        document.getElementById(id).classList.add('active');
    }
    function closeModals() {
        document.querySelectorAll('.maker-modal').forEach(m => m.classList.remove('active'));
    }
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    document.querySelector('.close-btn').addEventListener('click', () => openModal('save-prompt-modal'));
    document.getElementById('hotkey-btn').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('hotkey-modal');
    });

    // --- Phase 1: Header Image Uploader & Dragging ---
    const headerInput = document.getElementById('header-file-input');
    const headerBtn = document.getElementById('upload-header-btn');
    const headerOverlay = document.getElementById('header-upload-overlay');
    const headerImgContainer = document.getElementById('header-image-container');
    const headerClearBtn = document.getElementById('clear-header-btn');
    
    window.headerImageData = {
        base64: null,
        yOffset: 0
    };
    
    let isDraggingHeader = false;
    let startY = 0;

    headerBtn.addEventListener('click', () => headerInput.click());
    
    headerInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        compressImage(file, 3840, 3840, 0.85, (dataUrl) => {
            window.headerImageData.base64 = dataUrl;
            window.headerImageData.yOffset = 0;
            
            headerImgContainer.style.backgroundImage = `url(${dataUrl})`;
            headerImgContainer.style.backgroundPositionY = '0%';
            
            headerImgContainer.style.display = 'block';
            headerOverlay.style.display = 'none';
            headerClearBtn.style.display = 'flex';
            
            // Check image dimensions to toggle cursor
            const img = new Image();
            img.onload = () => {
                if (img.height > headerImgContainer.clientHeight) {
                    headerImgContainer.style.cursor = 'ns-resize';
                } else {
                    headerImgContainer.style.cursor = 'default';
                }
            };
            img.src = dataUrl;
        });
    });

    headerClearBtn.addEventListener('click', () => {
        window.headerImageData.base64 = null;
        window.headerImageData.yOffset = 0;
        headerImgContainer.style.display = 'none';
        headerOverlay.style.display = 'flex';
        headerClearBtn.style.display = 'none';
        headerInput.value = ''; // Reset input
    });

    headerImgContainer.addEventListener('mousedown', (e) => {
        if (headerImgContainer.style.cursor === 'ns-resize') {
            isDraggingHeader = true;
            startY = e.clientY;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (isDraggingHeader) {
            const dy = e.clientY - startY;
            // Map pixel movement to percentage
            window.headerImageData.yOffset -= (dy / headerImgContainer.clientHeight) * 100;
            window.headerImageData.yOffset = Math.max(0, Math.min(100, window.headerImageData.yOffset)); // Clamp 0-100
            headerImgContainer.style.backgroundPositionY = `${window.headerImageData.yOffset}%`;
            startY = e.clientY;
        }
    });

    window.addEventListener('mouseup', () => {
        isDraggingHeader = false;
    });

    // --- Phase 2: Article Controls ---
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => openModal('restart-prompt-modal'));
    
    document.querySelector('.confirm-restart-btn').addEventListener('click', () => {
        titleInput.value = 'ENTER_TITLE_HERE';
        if (window.headerImageData.base64) headerClearBtn.click();
        document.querySelectorAll('.maker-section').forEach(sec => sec.remove());
        document.getElementById('stub-input').value = '';
        closeModals();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
        }
        const restartModal = document.getElementById('restart-prompt-modal');
        if (restartModal && restartModal.classList.contains('active')) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.querySelector('.confirm-restart-btn').click();
            }
        }
        const saveModal = document.getElementById('save-prompt-modal');
        if (saveModal && saveModal.classList.contains('active')) {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.querySelector('.confirm-save-btn').click();
            }
        }
    });

    // --- Phase 2: Section Creator ---
    const sectionContainer = document.querySelector('.lightbox-content');
    
    // Initialize Sortable
    if (typeof Sortable !== 'undefined') {
        new Sortable(sectionContainer, {
            handle: '.drag-handle',
            animation: 150,
            ghostClass: 'sortable-ghost'
        });
    }

    const sectionTemplates = {
        'text': `<div class="rich-text-editor" contenteditable="true">Enter text here...</div>`,
        'quote': `<blockquote style="border-left: 2px solid var(--neon-cyan); padding-left: 15px; margin: 20px 0;">
                    <div class="rich-text-editor" contenteditable="true" style="font-style: italic;">"All I know is that I know nothing."</div>
                    <div class="rich-text-editor" contenteditable="true" style="text-align: right; margin-top: 10px; color: var(--neon-yellow);">- Socrates</div>
                  </blockquote>`,
        'html': `<textarea class="maker-input" style="width: 100%; min-height: 100px;" placeholder="Paste HTML/Embed code here"></textarea>`,
        'html-left': `<div style="display: flex; gap: 20px;">
                        <textarea class="maker-input html-editor" style="flex: 1; min-height: 150px; font-family: monospace;" placeholder="<!-- raw html here -->"></textarea>
                        <div class="rich-text-editor" contenteditable="true" style="flex: 2; min-height: 150px;">Enter text here...</div>
                    </div>`,
        'html-right': `<div style="display: flex; gap: 20px;">
                        <div class="rich-text-editor" contenteditable="true" style="flex: 2; min-height: 150px;">Enter text here...</div>
                        <textarea class="maker-input html-editor" style="flex: 1; min-height: 150px; font-family: monospace;" placeholder="<!-- raw html here -->"></textarea>
                    </div>`,
        'image': `<div style="text-align: center;">
                    <button class="maker-btn upload-img-btn">Upload Image</button>
                    <input type="file" accept="image/*" style="display: none;" class="img-file-input">
                    <img src="" style="width: 100%; height: auto; display: none; padding: 1px;" class="section-img">
                    <div class="rich-text-editor caption-editor" contenteditable="true" style="margin-top: 10px; display: none;">Caption (Optional)</div>
                  </div>`,
        'image-left': `<div style="display: block;">
                        <div style="float: left; width: 33%; margin-right: 20px; margin-bottom: 20px;">
                            <button class="maker-btn upload-img-btn">Upload Image</button>
                            <input type="file" accept="image/*" style="display: none;" class="img-file-input">
                            <img src="" style="width: 100%; height: auto; display: none; padding: 1px;" class="section-img">
                        </div>
                        <div class="rich-text-editor" contenteditable="true" style="min-height: 200px; display: block; overflow: visible;">Text wraps around...</div>
                        <div style="clear: both;"></div>
                       </div>`,
        'image-right': `<div style="display: block;">
                        <div style="float: right; width: 33%; margin-left: 20px; margin-bottom: 20px;">
                            <button class="maker-btn upload-img-btn">Upload Image</button>
                            <input type="file" accept="image/*" style="display: none;" class="img-file-input">
                            <img src="" style="width: 100%; height: auto; display: none; padding: 1px;" class="section-img">
                        </div>
                        <div class="rich-text-editor" contenteditable="true" style="min-height: 200px; display: block; overflow: visible;">Text wraps around...</div>
                        <div style="clear: both;"></div>
                       </div>`,
        'table-3': `<div style="display: flex; gap: 20px;">
                        <div class="data-module" style="flex: 1;">
                            <h2 class="module-title rich-text-editor" contenteditable="true" style="border:none; background:transparent;">Title 1</h2>
                            <div class="readout table-rows">
                                <span><strong contenteditable="true">LABEL</strong> <strong contenteditable="true">VALUE</strong></span>
                            </div>
                            <button class="maker-btn add-row-btn" style="width: 100%; margin-top: 10px; font-size: 10px;">+</button>
                            <div class="progress-track"><div class="progress-fill" data-color="cyan"></div></div>
                        </div>
                        <div class="data-module" style="flex: 1;">
                            <h2 class="module-title rich-text-editor" contenteditable="true" style="border:none; background:transparent;">Title 2</h2>
                            <div class="readout table-rows">
                                <span><strong contenteditable="true">LABEL</strong> <strong contenteditable="true">VALUE</strong></span>
                            </div>
                            <button class="maker-btn add-row-btn" style="width: 100%; margin-top: 10px; font-size: 10px;">+</button>
                            <div class="progress-track"><div class="progress-fill" style="width: 55%; background: var(--neon-yellow); box-shadow: 0 0 10px var(--neon-yellow);" data-color="yellow"></div></div>
                        </div>
                        <div class="data-module" style="flex: 1;">
                            <h2 class="module-title rich-text-editor" contenteditable="true" style="border:none; background:transparent;">Title 3</h2>
                            <div class="readout table-rows">
                                <span><strong contenteditable="true">LABEL</strong> <strong contenteditable="true">VALUE</strong></span>
                            </div>
                            <button class="maker-btn add-row-btn" style="width: 100%; margin-top: 10px; font-size: 10px;">+</button>
                            <div class="progress-track"><div class="progress-fill" style="width: 99%; background: var(--neon-magenta); box-shadow: 0 0 10px var(--neon-magenta);" data-color="magenta"></div></div>
                        </div>
                    </div>`,
        'table-left': `<div style="display: block;">
                        <div class="data-module" style="float: left; width: 33%; margin-right: 20px; margin-bottom: 20px;">
                            <h2 class="module-title rich-text-editor" contenteditable="true" style="border:none; background:transparent;">Table Title</h2>
                            <div class="readout table-rows">
                                <span><strong contenteditable="true">LABEL</strong> <strong contenteditable="true">VALUE</strong></span>
                            </div>
                            <button class="maker-btn add-row-btn" style="width: 100%; margin-top: 10px; font-size: 10px;">+</button>
                            <div class="progress-track" style="cursor: pointer;"><div class="progress-fill" data-color="yellow" style="width: 50%; background: var(--neon-yellow); box-shadow: 0 0 10px var(--neon-yellow);"></div></div>
                        </div>
                        <div class="rich-text-editor" contenteditable="true" style="min-height: 200px; display: block; overflow: visible;">Text wraps around...</div>
                        <div style="clear: both;"></div>
                       </div>`,
        'table-right': `<div style="display: block;">
                        <div class="data-module" style="float: right; width: 33%; margin-left: 20px; margin-bottom: 20px;">
                            <h2 class="module-title rich-text-editor" contenteditable="true" style="border:none; background:transparent;">Table Title</h2>
                            <div class="readout table-rows">
                                <span><strong contenteditable="true">LABEL</strong> <strong contenteditable="true">VALUE</strong></span>
                            </div>
                            <button class="maker-btn add-row-btn" style="width: 100%; margin-top: 10px; font-size: 10px;">+</button>
                            <div class="progress-track" style="cursor: pointer;"><div class="progress-fill" data-color="yellow" style="width: 50%; background: var(--neon-yellow); box-shadow: 0 0 10px var(--neon-yellow);"></div></div>
                        </div>
                        <div class="rich-text-editor" contenteditable="true" style="min-height: 200px; display: block; overflow: visible;">Text wraps around...</div>
                        <div style="clear: both;"></div>
                       </div>`,
        'video': `<div style="text-align: center; padding: 20px;">
                    <div style="margin-bottom: 10px; color: var(--neon-cyan); font-size: 0.8rem; text-transform: uppercase;">Video Embed</div>
                    <input type="text" class="maker-input video-url-input" style="width: 100%;" placeholder="Paste YouTube or Vimeo URL here">
                  </div>`
    };

    function addSection(type) {
        const sec = document.createElement('div');
        sec.className = 'maker-section';
        sec.dataset.type = type;
        selectionToRestore = null;
        
        sec.innerHTML = `
            <div class="drag-handle" title="Drag to reorder"></div>
            <button class="maker-icon-btn delete-section-btn" title="Delete Section">✖</button>
            <div class="section-content">${sectionTemplates[type]}</div>
        `;
        
        sec.querySelector('.delete-section-btn').addEventListener('click', () => {
            sec.remove();
        });
        
        // Attach image upload listeners if present
        const imgBtn = sec.querySelector('.upload-img-btn');
        if (imgBtn) {
            const fileInput = sec.querySelector('.img-file-input');
            const imgEl = sec.querySelector('.section-img');
            const caption = sec.querySelector('.caption-editor');
            
            imgBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                compressImage(file, 3840, 3840, 0.85, (dataUrl) => {
                    imgEl.src = dataUrl;
                    imgEl.dataset.base64 = dataUrl;
                    imgEl.style.display = 'block';
                    imgBtn.style.display = 'none';
                    if (caption) caption.style.display = 'block';
                });
            });
        }
        
        // Attach add row listeners for tables
        sec.querySelectorAll('.add-row-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rowsContainer = e.target.previousElementSibling;
                const clone = rowsContainer.lastElementChild.cloneNode(true);
                clone.querySelectorAll('[contenteditable]').forEach(el => el.innerHTML = 'NEW');
                rowsContainer.appendChild(clone);
            });
        });
        
        sec.querySelectorAll('.progress-track').forEach(track => {
            track.addEventListener('click', (e) => {
                const fill = track.querySelector('.progress-fill');
                if (!fill) return;
                
                const rect = track.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percentage = Math.round((clickX / rect.width) * 100);
                const rounded = Math.max(5, Math.min(100, Math.round(percentage / 5) * 5));
                fill.style.width = `${rounded}%`;
                fill.dataset.width = rounded;
                
                const currentColor = fill.dataset.color || 'cyan';
                if (currentColor === 'yellow') {
                    fill.dataset.color = 'magenta';
                    fill.style.background = 'var(--neon-magenta)';
                    fill.style.boxShadow = '0 0 10px var(--neon-magenta)';
                } else if (currentColor === 'magenta') {
                    fill.dataset.color = 'cyan';
                    fill.style.background = 'var(--neon-cyan)';
                    fill.style.boxShadow = '0 0 10px var(--neon-cyan)';
                } else {
                    fill.dataset.color = 'yellow';
                    fill.style.background = 'var(--neon-yellow)';
                    fill.style.boxShadow = '0 0 10px var(--neon-yellow)';
                }
            });
        });
        
        sectionContainer.appendChild(sec);
    }

    window.openDownloadModal = function() {
        if (!document.activeElement.closest('.rich-text-editor')) return;
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            selectionToRestore = sel.getRangeAt(0);
        }
        document.getElementById('download-url-input').value = '';
        document.getElementById('download-modal').style.display = 'flex';
        setTimeout(() => document.getElementById('download-url-input').focus(), 100);
    };

    document.getElementById('confirm-download-btn').addEventListener('click', () => {
        if (selectionToRestore) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(selectionToRestore);
        }
        const url = document.getElementById('download-url-input').value.trim();
        if (url) {
            const widgetHtml = `<div class="download-widget" contenteditable="false" data-url="${url}" style="width: 33%; height: 60px; display: inline-flex; align-items: center; justify-content: center; border: 1px dashed var(--neon-magenta); background: rgba(255, 0, 255, 0.1); margin: 10px; cursor: default; color: var(--neon-magenta); font-family: monospace;">
                <span style="font-size: 24px; margin-right: 10px;">📥</span> DOWNLOAD FILE
            </div><br>`;
            document.execCommand('insertHTML', false, widgetHtml);
        }
        document.getElementById('download-modal').style.display = 'none';
        selectionToRestore = null;
    });

    document.getElementById('download-url-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('confirm-download-btn').click();
        }
    });

    document.querySelectorAll('#section-creator .maker-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            addSection(e.target.dataset.type);
        });
    });

    // --- Phase 3: Context Menu and Hotkeys ---
    const ctxMenu = document.getElementById('context-menu');
    const ctxHasSelection = document.getElementById('ctx-has-selection');
    const ctxNoSelection = document.getElementById('ctx-no-selection');

    document.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.rich-text-editor')) {
            e.preventDefault();
            
            const selection = window.getSelection();
            if (selection.toString().trim().length > 0) {
                ctxHasSelection.style.display = 'flex';
                ctxHasSelection.style.flexDirection = 'column';
                ctxNoSelection.style.display = 'none';
            } else {
                ctxHasSelection.style.display = 'none';
                ctxNoSelection.style.display = 'flex';
                ctxNoSelection.style.flexDirection = 'column';
            }
            
            ctxMenu.style.display = 'flex';
            ctxMenu.style.left = `${e.pageX}px`;
            ctxMenu.style.top = `${e.pageY}px`;
        } else {
            ctxMenu.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#context-menu')) {
            ctxMenu.style.display = 'none';
        }
    });

    // Hotkeys
    window.addEventListener('keydown', (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const cmdKey = isMac ? e.metaKey : e.ctrlKey;
        
        if (cmdKey) {
            if (e.altKey && document.activeElement.closest('.rich-text-editor')) {
                if (e.code === 'Digit2' || e.key === '2') {
                    e.preventDefault();
                    document.execCommand('formatBlock', false, 'H2');
                } else if (e.code === 'Digit3' || e.key === '3') {
                    e.preventDefault();
                    document.execCommand('formatBlock', false, 'H3');
                } else if (e.code === 'Digit4' || e.key === '4') {
                    e.preventDefault();
                    document.execCommand('formatBlock', false, 'H4');
                }
                return;
            }

            if (e.code === 'Digit8' || e.key === '8') {
                if (document.activeElement.closest('.rich-text-editor')) {
                    e.preventDefault();
                    document.execCommand('insertUnorderedList', false, null);
                }
                return;
            } else if (e.code === 'Digit7' || e.key === '7') {
                if (document.activeElement.closest('.rich-text-editor')) {
                    e.preventDefault();
                    document.execCommand('insertOrderedList', false, null);
                }
                return;
            }

            switch(e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    document.getElementById('save-btn').click();
                    break;
                case 'o':
                    e.preventDefault();
                    document.getElementById('load-btn').click();
                    break;
                case 'b':
                    if(document.activeElement.closest('.rich-text-editor')) {
                        e.preventDefault();
                        document.execCommand('bold', false, null);
                    }
                    break;
                case 'i':
                    if(document.activeElement.closest('.rich-text-editor')) {
                        e.preventDefault();
                        document.execCommand('italic', false, null);
                    }
                    break;
                case 'u':
                    if(document.activeElement.closest('.rich-text-editor')) {
                        e.preventDefault();
                        document.execCommand('underline', false, null);
                    }
                    break;
                case 'k':
                    if(document.activeElement.closest('.rich-text-editor')) {
                        e.preventDefault();
                        openLinkModal();
                    }
                    break;
            }
        }
    });

    window.openLinkModal = function() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        window.currentLinkSelection = selection.getRangeAt(0);
        
        let existingUrl = '';
        let node = selection.anchorNode;
        while (node && node !== document.body) {
            if (node.nodeName === 'A') {
                existingUrl = node.href;
                break;
            }
            node = node.parentNode;
        }
        
        document.getElementById('link-url-input').value = existingUrl;
        document.getElementById('link-modal').classList.add('active');
        setTimeout(() => document.getElementById('link-url-input').focus(), 100);
    };    document.getElementById('link-url-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('confirm-link-btn').click();
        }
    });

    document.getElementById('confirm-link-btn').addEventListener('click', () => {
        const url = document.getElementById('link-url-input').value.trim();
        if (window.currentLinkSelection) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(window.currentLinkSelection);
            if (url) {
                document.execCommand('createLink', false, url);
            } else {
                document.execCommand('unlink', false, null);
            }
        }
        closeModals();
    });

    document.getElementById('unlink-btn').addEventListener('click', () => {
        if (window.currentLinkSelection) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(window.currentLinkSelection);
            document.execCommand('unlink', false, null);
        }
        closeModals();
    });

    // --- Phase 4: Save & Load ---
    const turndownService = new TurndownService({ headingStyle: 'atx' });
    turndownService.addRule('downloadWidget', {
        filter: function (node) {
            return node.classList && node.classList.contains('download-widget');
        },
        replacement: function (content, node) {
            return `[DOWNLOAD:${node.dataset.url}]`;
        }
    });
    turndownService.addRule('preserveFontsAndStyles', {
        filter: function (node) {
            return node.nodeName === 'FONT' || (node.nodeName === 'SPAN' && node.getAttribute('style'));
        },
        replacement: function (content, node) {
            if (node.nodeName === 'FONT') {
                const face = node.getAttribute('face') || '';
                const color = node.getAttribute('color') || '';
                const size = node.getAttribute('size') || '';
                const style = node.getAttribute('style') || '';
                let attrs = '';
                if (face) attrs += ` face="${face}"`;
                if (color) attrs += ` color="${color}"`;
                if (size) attrs += ` size="${size}"`;
                if (style) attrs += ` style="${style}"`;
                return `<font${attrs}>${content}</font>`;
            } else if (node.nodeName === 'SPAN') {
                const style = node.getAttribute('style') || '';
                return `<span style="${style}">${content}</span>`;
            }
            return content;
        }
    });

    function base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], {type: mimeType});
    }

    async function saveArticle() {
        const title = titleInput.value.trim();
        const stub = document.getElementById('stub-input').value.trim();

        if (title === 'ENTER_TITLE_HERE' || title === '') {
            alert('Please enter a valid title.');
            return closeModals();
        }
        if (stub === '') {
            alert('Please enter a valid stub for the URL.');
            return closeModals();
        }

        const zip = new JSZip();
        
        const articleData = {
            title: title,
            stub: stub,
            header: null,
            sections: []
        };

        if (window.headerImageData.base64) {
            if (window.headerImageData.base64.startsWith('data:image/')) {
                const isGif = window.headerImageData.base64.startsWith('data:image/gif');
                const ext = isGif ? 'gif' : 'jpeg';
                const headerFilename = `${stub}-header-image.${ext}`;
                let imagePayload = window.headerImageData.base64;
                if (!isGif) {
                    imagePayload = await cropHeaderImage(window.headerImageData.base64, window.headerImageData.yOffset || 50);
                }
                
                articleData.header = {
                    filename: `../${headerFilename}`,
                    yOffset: isGif ? (window.headerImageData.yOffset || 50) : 50
                };
                zip.file(headerFilename, base64ToBlob(imagePayload, `image/${ext}`));
            } else {
                let cleanName = window.headerImageData.base64.split('/').pop();
                articleData.header = {
                    filename: `../${cleanName}`,
                    yOffset: window.headerImageData.yOffset || 50
                };
            }
        }

        const usedImageNums = new Set();
        const sections = sectionContainer.querySelectorAll('.maker-section');
        sections.forEach(sec => {
            if (sec.dataset.type && sec.dataset.type.includes('image')) {
                const imgEl = sec.querySelector('.section-img');
                if (imgEl && imgEl.dataset.base64 && !imgEl.dataset.base64.startsWith('data:image/')) {
                    const match = imgEl.dataset.base64.match(/-(?:image|img)-(\d+)\./i);
                    if (match) {
                        usedImageNums.add(parseInt(match[1], 10));
                    }
                }
            }
        });
        let nextAvailableImageNum = 1;
        const getNextImageNum = () => {
            while (usedImageNums.has(nextAvailableImageNum)) {
                nextAvailableImageNum++;
            }
            usedImageNums.add(nextAvailableImageNum);
            return nextAvailableImageNum++;
        };

        sections.forEach((sec, index) => {
            const type = sec.dataset.type;
            let secData = { type: type, content: {} };

            if (type === 'text' || type === 'quote') {
                const editors = sec.querySelectorAll('.rich-text-editor');
                secData.content.texts = Array.from(editors).map(ed => turndownService.turndown(ed.innerHTML));
            } else if (type === 'html') {
                secData.content.html = sec.querySelector('textarea').value;
            } else if (type === 'html-left' || type === 'html-right') {
                const textEditor = sec.querySelector('.rich-text-editor');
                const htmlEditor = sec.querySelector('.html-editor');
                secData.content = {
                    text: turndownService.turndown(textEditor.innerHTML),
                    html: htmlEditor.value
                };
            } else if (type === 'video') {
                secData.content.url = sec.querySelector('.video-url-input').value;
            } else if (type.includes('image')) {
                const imgEl = sec.querySelector('.section-img');
                if (imgEl.dataset.base64) {
                    if (imgEl.dataset.base64.startsWith('data:image/')) {
                        const ext = imgEl.dataset.base64.split(';')[0].split('/')[1];
                        const imgNum = getNextImageNum();
                        const imgFilename = `${stub}-image-${imgNum}.${ext}`;
                        secData.content.imageFilename = `../${imgFilename}`;
                        zip.file(imgFilename, base64ToBlob(imgEl.dataset.base64, `image/${ext}`));
                    } else {
                        let cleanName = imgEl.dataset.base64.split('/').pop();
                        secData.content.imageFilename = `../${cleanName}`;
                    }
                }
                const caption = sec.querySelector('.caption-editor');
                if (caption && caption.style.display !== 'none') {
                    secData.content.caption = turndownService.turndown(caption.innerHTML);
                }
                const textEditor = sec.querySelector('.rich-text-editor:not(.caption-editor)');
                if (textEditor) {
                    secData.content.text = turndownService.turndown(textEditor.innerHTML);
                }
            } else if (type.includes('table')) {
                const modules = sec.querySelectorAll('.data-module');
                secData.content.tables = Array.from(modules).map(mod => {
                    const title = mod.querySelector('.module-title').innerText;
                    const rows = [];
                    Array.from(mod.querySelectorAll('.table-rows > *')).forEach(row => {
                        const items = row.querySelectorAll('strong');
                        if (items.length >= 2) {
                            rows.push({
                                label: items[0].innerText.trim(),
                                value: items[items.length - 1].innerText.trim()
                            });
                        }
                    });
                    const fill = mod.querySelector('.progress-fill');
                    const color = fill ? (fill.dataset.color || 'cyan') : 'cyan';
                    const width = fill ? parseFloat(fill.style.width || 50) : 50;
                    return { title: title, rows: rows, color: color, width: width };
                });
                const textEditor = sec.querySelector('.rich-text-editor:not(.module-title)');
                if (textEditor) {
                    secData.content.text = turndownService.turndown(textEditor.innerHTML);
                }
            }

            articleData.sections.push(secData);
        });

        zip.file(`${stub}.json`, JSON.stringify(articleData, null, 2));

        zip.generateAsync({type:"blob"}).then(function(content) {
            saveAs(content, `${stub}.zip`);
            closeModals();
        });
    }

    document.getElementById('save-btn').addEventListener('click', saveArticle);
    document.querySelector('.confirm-save-btn').addEventListener('click', saveArticle);

    // --- Phase 4: Load ---
    const loadInput = document.getElementById('load-file-input');
    document.getElementById('load-btn').addEventListener('click', () => loadInput.click());

    loadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.name.endsWith('.zip')) {
            const zip = new JSZip();
            zip.loadAsync(file).then(async (zipFiles) => {
                const jsonFile = Object.keys(zipFiles.files).find(n => n.endsWith('.json'));
                if (!jsonFile) return alert('No JSON file found in ZIP');
                
                const jsonStr = await zipFiles.file(jsonFile).async('string');
                const articleData = JSON.parse(jsonStr);
                
                await reconstructDOM(articleData, jsonFile, zipFiles);
            });
        } else if (file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const articleData = JSON.parse(e.target.result);
                await reconstructDOM(articleData, file.name, null);
            };
            reader.readAsText(file);
        }
    });

    const parseToEditor = (md) => {
        if (!md) return '';
        let parsed = marked.parse(md);
        parsed = parsed.replace(/\[DOWNLOAD:([^\]]+)\]/g, (match, url) => {
            return `<div class="download-widget" contenteditable="false" data-url="${url}" style="width: 33%; height: 60px; display: inline-flex; align-items: center; justify-content: center; border: 1px dashed var(--neon-magenta); background: rgba(255, 0, 255, 0.1); margin: 10px; cursor: default; color: var(--neon-magenta); font-family: monospace;">
                <span style="font-size: 24px; margin-right: 10px;">📥</span> DOWNLOAD FILE
            </div>`;
        });
        return parsed;
    };

    async function reconstructDOM(articleData, jsonFileName, zipFiles = null) {
        titleInput.value = articleData.title || 'UNTITLED';
        if (jsonFileName) {
            document.getElementById('stub-input').value = jsonFileName.replace('.json', '');
        } else if (articleData.stub) {
            document.getElementById('stub-input').value = articleData.stub;
        } else {
            document.getElementById('stub-input').value = (articleData.title || '').toLowerCase().replace(/ /g, '-');
        }
        
        if (articleData.header && articleData.header.filename) {
            // Migration for older names
            if (articleData.header.filename.includes('header-image') === false) {
                if (articleData.header.filename.includes('-header.')) {
                    articleData.header.filename = articleData.header.filename.replace('-header.', '-header-image.');
                } else if (articleData.header.filename.includes('header-')) {
                    articleData.header.filename = articleData.header.filename.replace('header-', '').replace(/\.([^.]+)$/, '-header-image.$1');
                }
            }
            let loadedFromZip = false;
            if (zipFiles) {
                let zipKey = articleData.header.filename.split('/').pop();
                const headerImgFile = zipFiles.file(zipKey);
                if (headerImgFile) {
                    const headerBase64 = await headerImgFile.async('base64');
                    const ext = articleData.header.filename.split('.').pop();
                    window.headerImageData.base64 = `data:image/${ext};base64,${headerBase64}`;
                    loadedFromZip = true;
                }
            }
            if (!loadedFromZip) {
                let cleanName = articleData.header.filename.split('/').pop();
                const filename = `../${cleanName}`;
                window.headerImageData.base64 = filename;
            }
            window.headerImageData.yOffset = articleData.header.yOffset;
            
            const headerImgContainer = document.getElementById('header-image-container');
            headerImgContainer.style.backgroundImage = `url(${window.headerImageData.base64})`;
            headerImgContainer.style.backgroundPositionY = `${window.headerImageData.yOffset}%`;
            headerImgContainer.style.display = 'block';
            
            document.getElementById('header-upload-overlay').style.display = 'none';
            document.getElementById('clear-header-btn').style.display = 'flex';
        }
        
        document.querySelectorAll('.maker-section').forEach(sec => sec.remove());
        
        for (let secData of articleData.sections) {
            addSection(secData.type);
            const lastSec = sectionContainer.lastElementChild;
            
            if (secData.type === 'text' || secData.type === 'quote') {
                const editors = lastSec.querySelectorAll('.rich-text-editor');
                secData.content.texts.forEach((md, idx) => {
                    if (editors[idx]) editors[idx].innerHTML = parseToEditor(md);
                });
            } else if (secData.type === 'html') {
                lastSec.querySelector('textarea').value = secData.content.html || '';
            } else if (secData.type === 'html-left' || secData.type === 'html-right') {
                const txtEl = lastSec.querySelector('.rich-text-editor');
                const htmlEl = lastSec.querySelector('.html-editor');
                if (secData.content.text && txtEl) txtEl.innerHTML = parseToEditor(secData.content.text);
                if (secData.content.html && htmlEl) htmlEl.value = secData.content.html;
            } else if (secData.type.includes('image')) {
                if (secData.content.imageFilename) {
                    // Migration for older names
                    if (secData.content.imageFilename.includes('image-') === false) {
                        if (secData.content.imageFilename.includes('-img-')) {
                            secData.content.imageFilename = secData.content.imageFilename.replace('-img-', '-image-');
                        } else if (secData.content.imageFilename.includes('img-')) {
                            secData.content.imageFilename = secData.content.imageFilename.replace('img-', '').replace(/-(\d+)\.([^.]+)$/, '-image-$1.$2');
                        }
                    }
                    const imgEl = lastSec.querySelector('.section-img');
                    let loadedFromZip = false;
                    if (zipFiles) {
                        let zipKey = secData.content.imageFilename.split('/').pop();
                        const imgFile = zipFiles.file(zipKey);
                        if (imgFile) {
                            const base64Data = await imgFile.async('base64');
                            const ext = secData.content.imageFilename.split('.').pop();
                            imgEl.dataset.base64 = `data:image/${ext};base64,${base64Data}`;
                            imgEl.src = imgEl.dataset.base64;
                            loadedFromZip = true;
                        }
                    }
                    if (!loadedFromZip) {
                        let cleanName = secData.content.imageFilename.split('/').pop();
                        const filename = `../${cleanName}`;
                        imgEl.src = filename;
                        imgEl.dataset.base64 = filename;
                    }
                    imgEl.style.display = 'block';
                    lastSec.querySelector('.upload-img-btn').style.display = 'none';
                    const caption = lastSec.querySelector('.caption-editor');
                    if (caption) caption.style.display = 'block';
                }
                const captionEl = lastSec.querySelector('.caption-editor');
                const txtEl = lastSec.querySelector('.rich-text-editor:not(.caption-editor)');
                if (secData.content.caption) {
                    if (captionEl) captionEl.innerHTML = marked.parseInline(secData.content.caption);
                }
                if (secData.content.text) {
                    if (txtEl) txtEl.innerHTML = parseToEditor(secData.content.text);
                }
            } else if (secData.type === 'video') {
                lastSec.querySelector('.video-url-input').value = secData.content.url || '';
            } else if (secData.type.includes('table')) {
                const modules = lastSec.querySelectorAll('.data-module');
                if (secData.content.tables) {
                    secData.content.tables.forEach((tData, idx) => {
                        if (modules[idx]) {
                            const titleEl = modules[idx].querySelector('.module-title');
                            if (titleEl) titleEl.innerHTML = marked.parseInline(tData.title);
                            
                            const rowsContainer = modules[idx].querySelector('.table-rows');
                            if (rowsContainer) {
                                rowsContainer.innerHTML = '';
                                tData.rows.forEach(row => {
                                    const span = document.createElement('span');
                                    span.innerHTML = `<strong contenteditable="true">${row.label}</strong> <strong contenteditable="true">${row.value}</strong>`;
                                    rowsContainer.appendChild(span);
                                });
                            }
                            
                            if (tData.color) {
                                const fill = modules[idx].querySelector('.progress-fill');
                                if (fill) {
                                    fill.dataset.color = tData.color;
                                    fill.style.background = `var(--neon-${tData.color})`;
                                    fill.style.boxShadow = `0 0 10px var(--neon-${tData.color})`;
                                }
                            }
                            
                            if (tData.width || tData.width === 0) {
                                const fill = modules[idx].querySelector('.progress-fill');
                                if (fill) {
                                    fill.style.width = `${tData.width}%`;
                                    fill.dataset.width = tData.width;
                                }
                            }
                        }
                    });
                }
                if (secData.content.text) {
                    const txtEl = lastSec.querySelector('.rich-text-editor:not(.module-title)');
                    if (txtEl) txtEl.innerHTML = parseToEditor(secData.content.text);
                }
            }
        }
    }

});
