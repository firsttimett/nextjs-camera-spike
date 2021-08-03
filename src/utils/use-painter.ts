import { MutableRefObject, useCallback, useRef } from "react";
import { isMobileDevice } from "./browser-helper";

interface MouseOffset {
	x: number;
	y: number;
}

export const usePainter = (canvas: MutableRefObject<HTMLCanvasElement | undefined>, sketch: MutableRefObject<HTMLDivElement | undefined>, initialColor: string) => {
	const isEraserMode = useRef(false);
	const eraserLineWidth = 10;
	const eraserColor = "black";

	const defaultLineWidth = 5;

	const currentColor = useRef(initialColor);

	const ctx = useRef(canvas?.current?.getContext("2d"));
	const mouse = useRef({ x: 0, y: 0 });

	// Pencil Points
	const ppts = useRef<MouseOffset[]>([]);

	let tmp_canvas: HTMLCanvasElement;
	let tmp_ctx: CanvasRenderingContext2D | null;

	/* Mouse Capturing Work */
	const mouseCapture = useCallback(
		(e: MouseEvent | TouchEvent) => {
			const ppt = getPencilPointFromEvent(e);

			if (ppt) {
				mouse.current = ppt;
			}
		}, []);

	const getPencilPointFromEvent = (e: MouseEvent | TouchEvent) => {
		if (e instanceof MouseEvent) {
			return { x: e.offsetX, y: e.offsetY };
		} else {
			if (e.targetTouches.length > 1) {
				return undefined;
			}
			const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
			return { x: e.targetTouches[0].pageX - rect.left, y: e.targetTouches[0].pageY - rect.top };
		}
	}

	const drawOnTemporaryCanvas = useCallback((e: MouseEvent | TouchEvent) => {
		// prevent scrolling when moving in canvas
		e.preventDefault();

		const ppt = getPencilPointFromEvent(e);

		if (ppt) {
			ppts.current.push(ppt);
		}

		if (tmp_ctx && ctx?.current) {
			if (isEraserMode.current) {
				// tmp_ctx.globalAlpha = 0.0;
				// tmp_ctx.strokeStyle = tmp_ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
				// tmp_ctx.strokeStyle = eraserColor;
				// tmp_ctx.strokeStyle = "";
				// tmp_ctx.fillStyle = "";
				tmp_ctx.strokeStyle = eraserColor;
				tmp_ctx.lineWidth = eraserLineWidth;
				tmp_ctx.globalCompositeOperation = "destination-out";
			} else {
				// tmp_ctx.globalAlpha = 1.0;
				tmp_ctx.strokeStyle = currentColor.current;
				tmp_ctx.lineWidth = defaultLineWidth;
				tmp_ctx.globalCompositeOperation = "source-over";
			}
		}

		const numberOfPoints = ppts.current.length;

		if (numberOfPoints < 3) {
			const firstPoint = ppts.current[0];

			tmp_ctx?.beginPath();
			tmp_ctx?.arc(firstPoint.x, firstPoint.y, tmp_ctx?.lineWidth / 2, 0, Math.PI * 2, !0);
			tmp_ctx?.fill();
			tmp_ctx?.closePath();

			return;
		}

		// Tmp canvas is always cleared up before drawing.
		tmp_ctx?.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

		tmp_ctx?.beginPath();
		tmp_ctx?.moveTo(ppts.current[0].x, ppts.current[0].y);

		for (let i = 1; i < numberOfPoints - 2; i++) {
			const startX = ppts.current[i].x;
			const startY = ppts.current[i].y;

			const endX = (startX + ppts.current[i + 1].x) / 2;
			const endY = (startY + ppts.current[i + 1].y) / 2;

			tmp_ctx?.quadraticCurveTo(startX, startY, endX, endY);
		}

		// For the last 2 points
		tmp_ctx?.quadraticCurveTo(
			ppts.current[numberOfPoints - 2].x,
			ppts.current[numberOfPoints - 2].y,
			ppts.current[numberOfPoints - 1].x,
			ppts.current[numberOfPoints - 1].y
		);
		tmp_ctx?.stroke();

	}, []);

	const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
		tmp_canvas.addEventListener(!isMobileDevice() ? "mousemove" : "touchmove", drawOnTemporaryCanvas);

		mouseCapture(e);

		const ppt = getPencilPointFromEvent(e);
		if (ppt) {
			ppts.current.push(ppt);
		}

		drawOnTemporaryCanvas(e);
	}, [drawOnTemporaryCanvas, mouseCapture]);

	const drawOnRealCanvas = useCallback(() => {
		tmp_canvas.removeEventListener(!isMobileDevice() ? "mousemove" : "touchmove", drawOnTemporaryCanvas);

		ctx.current?.drawImage(tmp_canvas, 0, 0);
		tmp_ctx?.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		ppts.current = [];
	}, [drawOnTemporaryCanvas]);

	const createTemporaryCanvas = useCallback(() => {
		tmp_canvas = document.createElement("canvas");
		tmp_ctx = tmp_canvas.getContext("2d");

		const rect = canvas.current?.getBoundingClientRect();

		tmp_canvas.id = "tmp_canvas";
		tmp_canvas.width = canvas.current?.clientWidth ?? 0;
		tmp_canvas.height = canvas.current?.clientHeight ?? 0;

		tmp_canvas.style.position = "absolute";
		tmp_canvas.style.top = `${(rect?.top ?? 0)}px`;
		tmp_canvas.style.left = `${(rect?.left ?? 0)}px`;

		if (tmp_ctx) {
			tmp_ctx.lineWidth = defaultLineWidth;
			tmp_ctx.lineJoin = tmp_ctx.lineCap = "round";
		}
	}, []);

	const init = useCallback(() => {
		ctx.current = canvas?.current?.getContext("2d");
		if (canvas && canvas.current && ctx && ctx.current) {
			createTemporaryCanvas();

			if (!isMobileDevice()) {
				tmp_canvas.addEventListener("mousedown", handleMouseDown);
				tmp_canvas.addEventListener("mousemove", mouseCapture);
				tmp_canvas.addEventListener("mouseup", drawOnRealCanvas);
			} else {
				tmp_canvas.addEventListener("touchstart", handleMouseDown);
				tmp_canvas.addEventListener("touchmove", mouseCapture);
				tmp_canvas.addEventListener("touchend", drawOnRealCanvas);
			}

			if (tmp_ctx) {
				tmp_ctx.strokeStyle = currentColor.current;
			}

			sketch.current?.appendChild(tmp_canvas);
		}
	}, []);

	const clearDrawing = useCallback(() => {
		if (!ctx || !ctx.current || !canvas || !canvas.current) {
			return;
		}
		ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
	}, []);

	const toggleEraserMode = useCallback(() => {
		if (ctx && ctx.current && tmp_ctx && tmp_ctx) {
			ctx.current.globalCompositeOperation = !isEraserMode.current ? "destination-out" : "source-over";
			isEraserMode.current = !isEraserMode.current;
			// tmp_ctx.globalCompositeOperation = isEraserMode.current ? "destination-out" : "source-over";
		}
	}, []);

	const changeColor = useCallback((newColor: string) => {
		currentColor.current = newColor;
	}, []);

	return ({
		init,
		clearDrawing,
		toggleEraserMode,
		changeColor,
	});
};
