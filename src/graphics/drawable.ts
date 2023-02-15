export default interface Drawable {

    /**
     * Render on target canvas
     * @param canvas target canvas
     */
    Draw(canvas: HTMLCanvasElement): void;

}