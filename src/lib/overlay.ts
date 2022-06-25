import { google } from 'google-maps';

export interface Overlay extends google.maps.OverlayView {}

/**
 * Extends an object's prototype by another's.
 *
 * @param type1 The Type to be extended.
 * @param type2 The Type to extend with.
 * @ignore
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extend(type1: any, type2: any): void {
  // eslint-disable-next-line prefer-const
  for (let property in type2.prototype) {
    type1.prototype[property] = type2.prototype[property];
  }
}

export class Overlay {
  private bounds: google.maps.LatLngBounds;
  private image: string;
  private div?: HTMLElement;

  constructor(bounds: google.maps.LatLngBounds) {
    extend(Overlay, google.maps.OverlayView);
    console.log(bounds);
    // super();
  }

  onAdd() {
    this.div = document.createElement('div');
    this.div.style.borderStyle = 'none';
    this.div.style.borderWidth = '0px';
    this.div.style.position = 'absolute';
    this.div.style.backgroundColor = 'pink';

    // Create the img element and attach it to the div.
    const img = document.createElement('img');

    img.src = this.image;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    this.div.appendChild(img);

    // Add the element to the "overlayLayer" pane.
    const panes = this.getPanes()!;

    panes.overlayLayer.appendChild(this.div);
  }

  draw() {
    const overlayProjection = this.getProjection();
    const sw = overlayProjection.fromLatLngToDivPixel(
      this.bounds.getSouthWest()
    )!;
    const ne = overlayProjection.fromLatLngToDivPixel(
      this.bounds.getNorthEast()
    )!;

    // Resize the image's div to fit the indicated dimensions.
    if (this.div) {
      this.div.style.left = sw.x + 'px';
      this.div.style.top = ne.y + 'px';
      this.div.style.width = ne.x - sw.x + 'px';
      this.div.style.height = sw.y - ne.y + 'px';
    }
  }

  onRemove() {
    if (this.div) {
      (this.div.parentNode as HTMLElement).removeChild(this.div);
      delete this.div;
    }
  }
}
