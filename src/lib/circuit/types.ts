export type JunctionId = string;
export type WireId = string;
export type ElementId = string;
export type ElectricalNodeId = string;

export type ElementType = "resistor" | "voltageSource" | "currentSource" | "ground";

export type Tool = "select" | "resistor" | "wire" | "ground";

export interface Junction {
  id: JunctionId;
  x: number;
  y: number;
}

export interface Wire {
  id: WireId;
  from: JunctionId;
  to: JunctionId;
}

export interface CircuitElement {
  id: ElementId;
  type: ElementType;
  label: string;
  /** One terminal for ground; two for all other elements. */
  terminals: JunctionId[];
  /** Ohms, volts, or amps depending on type. */
  value?: number;
  /**
   * Terminal that is treated as the + reference.
   * Used by later voltage / passive-sign modules.
   */
  plusTerminal?: JunctionId;
  /**
   * Current reference: current is assumed to enter `currentFrom`
   * and leave `currentTo`.
   */
  currentFrom?: JunctionId;
  currentTo?: JunctionId;
}

export interface Circuit {
  junctions: Junction[];
  wires: Wire[];
  elements: CircuitElement[];
}

export interface ElectricalNode {
  id: ElectricalNodeId;
  label: string;
  junctionIds: JunctionId[];
  isGround: boolean;
  voltage: number | null;
  /** Two-terminal elements that touch this node. */
  incidentElementIds: ElementId[];
  extraordinary: boolean;
}

export interface ElementBinding {
  elementId: ElementId;
  nodeIds: ElectricalNodeId[];
}

export interface CircuitAnalysis {
  nodes: ElectricalNode[];
  junctionToNode: Record<JunctionId, ElectricalNodeId>;
  elementBindings: Record<ElementId, ElementBinding>;
}

export type ElementRelation = "series" | "parallel" | "neither";

export interface RelationExplanation {
  relation: ElementRelation;
  summary: string;
  why: string;
  sharedNodeIds: ElectricalNodeId[];
}

export interface TerminalTouch {
  elementId: ElementId;
  elementLabel: string;
  elementType: ElementType;
  terminalIndex: number;
  side: "left" | "right" | "top" | "bottom" | "end";
}
