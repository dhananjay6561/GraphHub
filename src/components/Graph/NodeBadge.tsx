import type { NodeType } from "@/types";

const TYPE_COLOR: Record<NodeType, string> = {
  folder: "var(--node-folder)",
  file: "var(--node-file)",
  function: "var(--node-function)",
  class: "var(--node-class)",
};

const TYPE_LABEL: Record<NodeType, string> = {
  folder: "FOLDER",
  file: "FILE",
  function: "FUNCTION",
  class: "CLASS",
};

export function NodeBadge({ type }: { type: NodeType }) {
  const color = TYPE_COLOR[type];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium"
      style={{
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      {TYPE_LABEL[type]}
    </span>
  );
}
