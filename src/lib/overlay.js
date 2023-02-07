class OverlayContainer extends google.maps.OverlayView {
  constructor(map) {
    super();
    this.map = map;
  }

  onRemove() {
    this.div.parentNode.removeChild(this.div);
    this.div = null;
  }

  onAdd() {
    this.div = document.createElement('div');
    this.div.style.position = 'absolute';
    this.div.id = 'GoogleClustrOverlay';
    const panes = this.getPanes();
    panes.overlayImage.appendChild(this.div);
  }

  draw() {
    const overlayProjection = this.getProjection();
    const sw = overlayProjection.fromLatLngToDivPixel(
      this.map.getBounds().getSouthWest()
    );
    const ne = overlayProjection.fromLatLngToDivPixel(
      this.map.getBounds().getNorthEast()
    );
    this.div.style.left = `${sw.x}px`;
    this.div.style.top = `${ne.y}px`;
  }
}

export default OverlayContainer;
