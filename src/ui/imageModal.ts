export const seeFullImageBtnClasses = new Set(["_3hUbl08LBz2mbXjy0iYhOS", "_3b8u2OJXaSDdBWoRB7zUoK"]);

export function openImageModal(imageUrl: string, alt?: string): void {
	const overlay = document.createElement("div");
	overlay.className = "original-image-modal";
	overlay.setAttribute("role", "dialog");
	overlay.setAttribute("aria-modal", "true");
	overlay.setAttribute("aria-label", "Full-size image viewer");

	const toolbar = document.createElement("div");
	toolbar.className = "original-image-toolbar";

	const zoomOut = document.createElement("button");
	zoomOut.type = "button";
	zoomOut.textContent = "−";
	zoomOut.title = "Zoom out";
	zoomOut.setAttribute("aria-label", "Zoom out");

	const zoomLabel = document.createElement("span");
	zoomLabel.className = "original-image-zoom-label";

	const zoomIn = document.createElement("button");
	zoomIn.type = "button";
	zoomIn.textContent = "+";
	zoomIn.title = "Zoom in";
	zoomIn.setAttribute("aria-label", "Zoom in");

	const resetZoom = document.createElement("button");
	resetZoom.type = "button";
	resetZoom.textContent = "100%";
	resetZoom.title = "Reset zoom";

	const close = document.createElement("button");
	close.type = "button";
	close.textContent = "×";
	close.title = "Close image viewer";
	close.setAttribute("aria-label", "Close image viewer");

	const viewport = document.createElement("div");
	viewport.className = "original-image-viewport";

	const image = document.createElement("img");
	image.className = "original-image-content";
	image.src = imageUrl;
	image.alt = alt || "Full-size image";
	image.draggable = false;

	// The image's CSS dimensions represent its natural dimensions
	// multiplied by the current zoom level. to original resolution and scroll to view the rest (if image is larger than screen) or stretch out the image to fit the screen (if smaller than screen)
	let zoom = 1;
	const minZoom = 0.1;
	const maxZoom = 8;
	const zoomStep = 1.25;

	function updateZoom(): void {
		zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
		image.style.width = `${image.naturalWidth * zoom}px`;
		image.style.height = `${image.naturalHeight * zoom}px`;
		resetZoom.textContent = `${Math.round(zoom * 100)}%`;
		zoomOut.disabled = zoom <= minZoom;
		zoomIn.disabled = zoom >= maxZoom;
	}

	function setZoom(nextZoom: number): void {
		zoom = Math.min(maxZoom, Math.max(minZoom, nextZoom));
		updateZoom();
	}

	zoomOut.addEventListener("click", () => setZoom(zoom / zoomStep));
	zoomIn.addEventListener("click", () => setZoom(zoom * zoomStep));
	resetZoom.addEventListener("click", () => setZoom(1));

	function closeModal(): void {
		overlay.remove();
		document.removeEventListener("keydown", onKeyDown);
	}

	function onKeyDown(e: KeyboardEvent): void {
		if (e.key === "Escape") {
			closeModal();
		} else if (e.key === "+" || e.key === "=") {
			setZoom(zoom * zoomStep);
		} else if (e.key === "-") {
			setZoom(zoom / zoomStep);
		} else if (e.key === "0") {
			setZoom(1);
		}
	}

	close.addEventListener("click", closeModal);

	// Close when clicking the backdrop, but not the image or toolbar.
	overlay.addEventListener("click", e => {
		if (e.target === overlay) closeModal();
	});

	// Ctrl + mouse wheel zooms in and out.
	viewport.addEventListener(
		"wheel",
		e => {
			if (!e.ctrlKey) return;

			e.preventDefault();
			setZoom(zoom * (e.deltaY < 0 ? zoomStep : 1 / zoomStep));
		},
		{ passive: false },
	);

	toolbar.append(zoomOut, zoomLabel, zoomIn, resetZoom, close);
	viewport.appendChild(image);
	overlay.append(toolbar, viewport);
	document.body.appendChild(overlay);

	// Wait until the image is loaded to determine its natural dimensions.
	const initialize = (): void => {
		if (!image.naturalWidth || !image.naturalHeight) return;
		updateZoom();
	};

	if (image.complete) {
		initialize();
	} else {
		image.addEventListener("load", initialize, { once: true });
	}

	document.addEventListener("keydown", onKeyDown);

	// Prevent the original page from scrolling behind the modal.
	// The overlay itself is scrollable.
	viewport.focus({ preventScroll: true });
}
