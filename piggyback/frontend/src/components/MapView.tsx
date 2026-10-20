import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip } from "react-leaflet";
import type { Hub, Shipment, Vehicle, WorldState } from "../types";

const STATUS_COLORS: Record<Shipment["status"], string> = {
  CREATED: "#64748b",
  IN_TRANSIT: "#22c55e",
  AT_HUB: "#34d399",
  DELAYED: "#facc15",
  MISPLACED: "#ef4444",
  DISRUPTED: "#f97316",
  RECOVERING: "#3b82f6",
  RECOVERED: "#16a34a",
  DELIVERED: "#16a34a",
  CANCELLED: "#475569",
};

/** CSS keyframes for the pulsing lost-package halo (PS §24). */
const pulseCss = `
@keyframes lostPulse { 0% {opacity:.9; r:9;} 70% {opacity:0; r:20;} 100% {opacity:0; r:20;} }
.lost-pulse { animation: lostPulse 1.6s ease-out infinite; }
`;

const kindName: Record<string, string> = {
  TRUCK: "Truck", VAN: "Van", RAIL: "Train", AIR: "Plane",
};
const kindIcon: Record<string, string> = {
  TRUCK: "🚛", VAN: "🚐", RAIL: "🚂", AIR: "✈️",
};

export default function MapView({
  state,
  selectedId,
  onSelectShipment,
}: {
  state: WorldState;
  selectedId: string | null;
  onSelectShipment: (id: string) => void;
}) {
  const hubById = new Map(state.hubs.map((h) => [h.id, h]));

  return (
    <MapContainer
      center={[28.0, 77.0]}
      zoom={9}
      style={{ height: "100%", width: "100%", background: "#0f172a" }}
      preferCanvas
    >
      <style>{pulseCss}</style>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* planned route polylines for misplaced shipments' carriers */}
      {state.vehicles.map((v) => {
        const pts = v.route_hub_sequence
          .map((hid) => hubById.get(hid))
          .filter((h): h is Hub => !!h)
          .map((h) => [h.lat, h.lng] as [number, number]);
        if (pts.length < 2) return null;
        const isCarrierOfSelected = state.shipments.some(
          (s) => s.id === selectedId && s.assigned_vehicle_id === v.id
        );
        return (
          <Polyline
            key={`route-${v.id}`}
            positions={pts}
            pathOptions={{
              color: isCarrierOfSelected ? "#f59e0b" : "#64748b",
              weight: isCarrierOfSelected ? 3 : 1,
              opacity: isCarrierOfSelected ? 0.9 : 0.35,
              dashArray: "4 6",
            }}
          />
        );
      })}

      {/* hubs (cities, PS §24) */}
      {state.hubs.map((h) => (
        <CircleMarker
          key={h.id}
          center={[h.lat, h.lng]}
          radius={h.status === "CLOSED" ? 9 : 7}
          pathOptions={{
            color: "#0f172a",
            weight: 1.5,
            fillColor: h.status === "CLOSED" ? "#6b7280" : "#e2e8f0",
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            🏢 {h.name}{h.status === "CLOSED" ? " — CLOSED" : ""}
          </Tooltip>
        </CircleMarker>
      ))}

      {/* vehicles with direction stubs (PS §24): a short segment from the
          current position toward the next hub on the route */}
      {state.vehicles.map((v) => {
        const nextHub = hubById.get(v.route_hub_sequence[Math.min(v.current_leg_index + 1, v.route_hub_sequence.length - 1)]);
        let dir: [number, number][] | null = null;
        if (nextHub) {
          const dx = nextHub.lat - v.current_position.lat;
          const dy = nextHub.lng - v.current_position.lng;
          const norm = Math.hypot(dx, dy) || 1;
          const L = 0.06; // degrees (~6km) stub
          dir = [
            [v.current_position.lat, v.current_position.lng],
            [v.current_position.lat + (dx / norm) * L, v.current_position.lng + (dy / norm) * L],
          ];
        }
        const kindIco = kindIcon[v.type] ?? "🚛";
        return (
          <div key={v.id}>
            {dir && <Polyline positions={dir} pathOptions={{ color: "#fbbf24", weight: 2, opacity: 0.55 }} />}
            <CircleMarker
              center={[v.current_position.lat, v.current_position.lng]}
              radius={4}
              pathOptions={{ color: "#0f172a", weight: 1, fillColor: v.status === "COMPLETED" ? "#64748b" : "#fbbf24", fillOpacity: 1 }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                {kindIco} {kindName[v.type] ?? v.type} {v.id} · {v.status} · {Math.round(v.total_capacity_kg - v.used_capacity_kg)}kg free
              </Tooltip>
            </CircleMarker>
          </div>
        );
      })}

      {/* shipments (packages, PS §22/§24): green normal, red lost (pulsing),
          blue being rescued, gray ✓ delivered */}
      {state.shipments.map((s: Shipment) => {
        const color = STATUS_COLORS[s.status] ?? "#94a3b8";
        const isSel = s.id === selectedId;
        const isLost = s.status === "MISPLACED" || s.status === "DISRUPTED";
        const delivered = s.status === "DELIVERED" || s.status === "RECOVERED";
        const origin = hubById.get(s.origin_hub_id);
        const dest = hubById.get(s.destination_hub_id);
        return (
          <div key={s.id}>
            {isLost && (
              <CircleMarker
                center={[s.current_location.lat, s.current_location.lng]}
                radius={9}
                pathOptions={{ color: "#ef4444", weight: 2, fillColor: "#ef4444", fillOpacity: 0.35, className: "lost-pulse" }}
                interactive={false}
              />
            )}
            <CircleMarker
              center={[s.current_location.lat, s.current_location.lng]}
              radius={isLost ? (isSel ? 10 : 7) : isSel ? 8 : 4}
              pathOptions={{
                color: isSel ? "#fff" : "#0f172a",
                weight: isSel ? 3 : 1,
                fillColor: color,
                fillOpacity: delivered ? 0.55 : 0.95,
                dashArray: delivered ? "2 3" : undefined,
              }}
              eventHandlers={{
                click: () => {
                  if (isLost) onSelectShipment(s.id);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <div>
                  📦 <b>{s.id}</b> · {s.priority} · {s.weight_kg.toFixed(0)}kg
                  <br />
                  {origin?.name ?? s.origin_hub_id} → {dest?.name ?? s.destination_hub_id}
                  <br />
                  {isLost ? "🔴 Lost — click for rescue plans" : delivered ? "✓ Delivered" : s.status === "RECOVERING" ? "🔵 Being rescued" : "🟢 On track"}
                </div>
              </Tooltip>
            </CircleMarker>
          </div>
        );

      })}
    </MapContainer>
  );
}

export type { WorldState, Vehicle };
