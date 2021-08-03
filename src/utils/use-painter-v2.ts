import { MutableRefObject, useCallback, useRef } from "react";
import { isMobileDevice } from "./browser-helper";

interface MouseOffset {
	x: number;
	y: number;
}

// References
// https://stackoverflow.com/questions/10567287/implementing-smooth-sketching-and-drawing-on-the-canvas-element
// http://jsfiddle.net/aMmVQ/
export const usePainter = (canvas: MutableRefObject<HTMLCanvasElement | undefined>, initialColor: string) => {
	const eraserLineWidth = 10;
	const defaultLineWidth = 5;

	const currentColor = useRef(initialColor);
	const isEraser = useRef(false);
	const isStarted = useRef(false);
	// Pencil Points
	const ppts = useRef<MouseOffset[]>([]);

	const ctx = useRef(canvas?.current?.getContext("2d"));

	let memCanvas: HTMLCanvasElement;
	let memContext: CanvasRenderingContext2D | null;

	const recordPencilPoint = (e: MouseEvent | TouchEvent) => {
		if (e instanceof MouseEvent) {
			ppts.current.push({ x: e.offsetX, y: e.offsetY });
		} else {
			// don't draw if more than 1 finger
			if (e.targetTouches.length > 1) {
				return;
			}
			const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
			ppts.current.push({ x: e.targetTouches[0].pageX - rect.left - window.scrollX, y: e.targetTouches[0].pageY - rect.top - window.scrollY });
		}
	}

	const drawPoints = useCallback(() => {
		if (!ctx || !ctx.current) {
			return;
		}

		if (isEraser.current) {
			ctx.current.globalCompositeOperation = "destination-out";
		}

		ctx.current.strokeStyle = ctx.current.fillStyle = currentColor.current;
		ctx.current.lineWidth = isEraser.current ? eraserLineWidth : defaultLineWidth;
		ctx.current.lineJoin = ctx.current.lineCap = "round";

		const numPoints = ppts.current.length;

		// draw a basic circle instead
		if (numPoints < 3) {
			const firstPoint = ppts.current[0];

			ctx.current.beginPath();
			ctx.current.arc(firstPoint.x, firstPoint.y, ctx.current.lineWidth / 2, 0, Math.PI * 2, !0);
			ctx.current.closePath();
			ctx.current.fill();

			if (isEraser.current) {
				ctx.current.globalCompositeOperation = "source-over";
			}
			return;
		}

		ctx.current.beginPath();
		ctx.current.moveTo(ppts.current[0].x, ppts.current[0].y);

		for (let i = 1; i < numPoints - 2; i++) {
			const x = (ppts.current[i].x + ppts.current[i + 1].x) / 2;
			const y = (ppts.current[i].y + ppts.current[i + 1].y) / 2;

			ctx.current.quadraticCurveTo(ppts.current[i].x, ppts.current[i].y, x, y);
		}

		ctx.current.quadraticCurveTo(ppts.current[numPoints - 2].x, ppts.current[numPoints - 2].y, ppts.current[numPoints - 1].x, ppts.current[numPoints - 1].y);
		ctx.current.stroke();

		if (isEraser.current) {
			ctx.current.globalCompositeOperation = "source-over";
		}
	}, []);

	const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
		isStarted.current = true;
		recordPencilPoint(e);
		drawPoints();
	}, []);

	const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
		// prevent scrolling when moving in canvas
		// preventDefault instead of touch-action:none because the latter will highlight the canvas and Done button on top
		e.preventDefault();

		if (!isStarted.current || !ctx || !ctx.current || !canvas || !canvas.current) {
			return;
		}

		ctx.current.clearRect(0, 0, canvas.current?.clientWidth, canvas.current?.clientHeight);
		ctx.current.drawImage(memCanvas, 0, 0);

		recordPencilPoint(e);
		drawPoints();
	}, []);

	const handleMouseUp = useCallback((_: MouseEvent | TouchEvent) => {
		if (isStarted.current && memContext && canvas && canvas.current) {
			isStarted.current = false;
			memContext.clearRect(0, 0, memCanvas.width, memCanvas.height);
			memContext.drawImage(canvas.current, 0, 0);
			ppts.current = [];
		}
	}, []);

	const createMemoryCanvas = useCallback((width: number, height: number) => {
		memCanvas = document.createElement("canvas");
		memContext = memCanvas.getContext("2d");

		memCanvas.width = width;
		memCanvas.height = height;
	}, []);

	const init = useCallback(() => {
		ctx.current = canvas?.current?.getContext("2d");

		if (canvas && canvas.current && ctx && ctx.current) {
			createMemoryCanvas(canvas.current.width, canvas.current.height);

			// Or just add the event listener for both mouse and touch without checking
			if (!isMobileDevice()) {
				canvas.current.addEventListener("mousedown", handleMouseDown);
				canvas.current.addEventListener("mousemove", handleMouseMove);
				canvas.current.addEventListener("mouseup", handleMouseUp);
			} else {
				canvas.current.addEventListener("touchstart", handleMouseDown);
				canvas.current.addEventListener("touchmove", handleMouseMove);
				canvas.current.addEventListener("touchend", handleMouseUp);
			}
		}
	}, []);

	const clearDrawing = useCallback(() => {
		if (!ctx || !ctx.current || !canvas || !canvas.current || !memContext) {
			return;
		}
		ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
		memContext.clearRect(0, 0, memCanvas.width, memCanvas.height);
	}, []);

	const setIsEraser = useCallback((isEraserMode: boolean) => {
		isEraser.current = isEraserMode;
	}, []);

	const changeColor = useCallback((newColor: string) => {
		currentColor.current = newColor;
	}, []);

	return ({
		init,
		clearDrawing,
		setIsEraser,
		changeColor,
	});
};
