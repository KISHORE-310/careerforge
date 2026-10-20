export type HubStatus = "ACTIVE" | "CLOSED";
export type VehicleStatus = "IN_TRANSIT" | "AT_HUB" | "COMPLETED";
export type ShipmentStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "AT_HUB"
  | "DELAYED"
  | "MISPLACED"
  | "DISRUPTED"
  | "RECOVERING"
  | "RECOVERED"
  | "DELIVERED"
  | "CANCELLED";
export type Priority = "PLATINUM" | "GOLD" | "SILVER" | "STANDARD";
export type VehicleType = "TRUCK" | "VAN" | "RAIL" | "AIR";
export type ChaosScenario =
  | "close-hub"
  | "reopen-hub"
  | "fail-vehicle"
  | "reduce-capacity"
  | "disrupt-route"
  | "delay-shipment"
  | "destination-unavailable";

export interface Hub {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: HubStatus;
  transfer_time_hours: number;
  handling_cost_per_kg: number;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  route_hub_sequence: string[];
  current_position: { lat: number; lng: number };
  current_leg_index: number;
  progress_on_leg_km: number;
  total_capacity_kg: number;
  used_capacity_kg: number;
  cost_per_km: number;
  speed_kmh: number;
  status: VehicleStatus;
}

export interface Shipment {
  id: string;
  origin_hub_id: string;
  destination_hub_id: string;
  current_location: { lat: number; lng: number };
  planned_route_id: string;
  deadline: string;
  priority: Priority;
  weight_kg: number;
  value_usd: number;
  status: ShipmentStatus;
  last_scan_event_at: string;
  assigned_vehicle_id: string | null;
  current_leg_index: number | null;
  recovery_pickup_hub_id: string | null;
}

export interface RecoveryEvent {
  id: string;
  shipment_id: string;
  detected_at: string;
  detection_reason: string;
  plain_reason: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  candidates_evaluated: number;
  chosen_option: RecoveryOption | null;
  status: "PENDING" | "RESOLVED" | "EXPIRED";
}

export interface RecoveryOption {
  shipment_id: string;
  rank: number;
  strategy_label: string;
  vehicle_ids: string[];
  transfer_hub_ids: string[];
  estimated_cost_usd: number;
  dedicated_cost_usd: number;
  cost_saved_usd: number;
  estimated_delay_hours: number;
  co2_saved_kg: number;
  utilization_gain: number;
  score: number;
  score_breakdown: Record<string, number>;
  explanation: string;
  risk_score?: number;
}

export interface RiskFactor {
  shipment_id: string;
  risk: number;
  level: string;
  factors: Record<string, number>;
  explanation: string;
}

export interface Insights {
  summary: string;
  top_risks: RiskFactor[];
  ai: { enabled: boolean; provider: string | null; model: string | null; fallback: string };
  generated_at: string;
}

export interface WorldState {
  sim_time_offset_hours: number;
  tick: number;
  running: boolean;
  speed_multiplier: number;
  hubs: Hub[];
  vehicles: Vehicle[];
  shipments: Shipment[];
  events: RecoveryEvent[];
  metrics: {
    total_cost_saved_usd: number;
    total_delay_hours_saved: number;
    total_co2_saved_kg: number;
    total_space_used_kg?: number;
    recovered_count: number;
  };
}

export interface ApiErrorShape {
  success: false;
  error: { code: string; message: string; request_id?: string };
}

export interface Toast {
  id: number;
  message: string;
}
