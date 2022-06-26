class Overlay extends google.maps.OverlayView {
  bounds;
  image;
  div;
  constructor(bounds, image) {
    super();
    this.bounds = bounds;
    this.image = image;
  }
  onAdd() {
    this.div = document.createElement('div');
    this.div.style.borderStyle = 'none';
    this.div.style.borderWidth = '0px';
    this.div.style.position = 'absolute';

    const panes = this.getPanes();

    panes.overlayLayer.appendChild(this.div);
  }
  draw() {
    const overlayProjection = this.getProjection();
    const sw = overlayProjection.fromLatLngToDivPixel(
      this.bounds.getSouthWest()
    );
    const ne = overlayProjection.fromLatLngToDivPixel(
      this.bounds.getNorthEast()
    );
    if (this.div) {
      this.div.style.left = sw.x + 'px';
      this.div.style.top = ne.y + 'px';
      this.div.style.width = ne.x - sw.x + 'px';
      this.div.style.height = sw.y - ne.y + 'px';
    }
  }

  onRemove() {
    if (this.div) {
      this.div.parentNode.removeChild(this.div);
      delete this.div;
    }
  }
}
