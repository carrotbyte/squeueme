// Singapore geographic bounding box
const SG_BOUNDS = {
  latMin: 1.1596,
  latMax: 1.4784,
  lngMin: 103.5938,
  lngMax: 104.0945,
};

export function isInSingapore(lat: number, lng: number): boolean {
  return (
    lat >= SG_BOUNDS.latMin &&
    lat <= SG_BOUNDS.latMax &&
    lng >= SG_BOUNDS.lngMin &&
    lng <= SG_BOUNDS.lngMax
  );
}

export type GeoResult =
  | { ok: true; lat: number; lng: number }
  | { ok: false; reason: "permission_denied" | "unavailable" | "outside_singapore" };

export function checkSingaporeLocation(): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ok: false, reason: "unavailable" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (isInSingapore(lat, lng)) {
          resolve({ ok: true, lat, lng });
        } else {
          resolve({ ok: false, reason: "outside_singapore" });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          resolve({ ok: false, reason: "permission_denied" });
        } else {
          resolve({ ok: false, reason: "unavailable" });
        }
      },
      { timeout: 10_000, maximumAge: 300_000 }
    );
  });
}
