// Bottom-sheet snap geometry (shared by Sheet and the map framing in App)

const PEEK_PX = 132; // visible height of the collapsed bottom sheet
export const TOP_GAP_PX = 8; // gap between the top bar and a fully open sheet

export function snapOffsets(sheetHeight, viewportHeight) {
  return {
    full: 0,
    half: Math.max(0, sheetHeight - Math.round(viewportHeight * 0.52)),
    peek: Math.max(0, sheetHeight - PEEK_PX),
  };
}

// Visible sheet height for a snap (used to keep the route clear of the sheet on mobile)
export function visibleSheetHeight(snap, sheetHeight, viewportHeight) {
  return sheetHeight - snapOffsets(sheetHeight, viewportHeight)[snap];
}
