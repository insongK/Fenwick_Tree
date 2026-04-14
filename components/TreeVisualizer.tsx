"use client";

import { motion } from "framer-motion";
import { getResponsibleRange, lowbit } from "@/lib/fenwick";

interface Props {
  tree: number[];
  size: number;
  highlightIndices: number[];
  highlightType: "update" | "query" | "none";
}

export default function TreeVisualizer({
  tree,
  size,
  highlightIndices,
  highlightType,
}: Props) {
  const highlightSet = new Set(highlightIndices);

  // 셀 너비/높이 (px)
  const cellW = 44;
  const cellH = 36;
  const gapX = 4;
  const paddingX = 8;
  const rowH = 80;

  // 각 인덱스의 담당 범위 너비(칸 수) = lowbit(i)
  const totalWidth = size * (cellW + gapX) - gapX + paddingX * 2;

  // 인덱스별 x 위치 (담당 범위의 마지막 인덱스가 오른쪽 끝에 맞음)
  const xPos = (idx: number) => {
    // 오른쪽 끝 = (idx - 1) * (cellW + gapX) + paddingX + cellW/2
    const [start] = getResponsibleRange(idx);
    const lb = lowbit(idx);
    // 블록 왼쪽 = (start - 1) * (cellW + gapX) + paddingX
    const left = (start - 1) * (cellW + gapX) + paddingX;
    const width = lb * (cellW + gapX) - gapX;
    return { left, width };
  };

  // 레벨별 그룹 (lowbit 크기 기준)
  // 레벨 0: lowbit=1 (홀수 인덱스들), 레벨 1: lowbit=2, ...
  const maxLevel = Math.floor(Math.log2(size));
  const levels: number[][] = Array.from({ length: maxLevel + 1 }, () => []);
  for (let i = 1; i <= size; i++) {
    const level = Math.log2(lowbit(i));
    if (Number.isInteger(level)) {
      levels[Math.round(level)].push(i);
    }
  }

  const svgHeight = (maxLevel + 1) * rowH + 20;

  // 연결선 (부모-자식)
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 1; i <= size; i++) {
    const parent = i + lowbit(i);
    if (parent <= size) {
      const childLevel = Math.log2(lowbit(i));
      const parentLevel = Math.log2(lowbit(parent));
      if (Number.isInteger(childLevel) && Number.isInteger(parentLevel)) {
        const cPos = xPos(i);
        const pPos = xPos(parent);
        const cY = svgHeight - (Math.round(childLevel) + 1) * rowH + rowH / 2 - 20;
        const pY = svgHeight - (Math.round(parentLevel) + 1) * rowH + rowH / 2 - 20;
        edges.push({
          x1: cPos.left + cPos.width / 2,
          y1: cY,
          x2: pPos.left + pPos.width / 2,
          y2: pY,
        });
      }
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-2">
      <h2 className="text-lg font-semibold text-white">트리 구조 시각화</h2>
      <p className="text-gray-400 text-xs">
        블록 너비 = 담당 범위 크기 (lowbit 값) | 위로 갈수록 상위 노드
      </p>

      <div className="overflow-x-auto">
        <div style={{ position: "relative", width: totalWidth, height: svgHeight }}>
          {/* 연결선 SVG */}
          <svg
            style={{ position: "absolute", top: 0, left: 0 }}
            width={totalWidth}
            height={svgHeight}
          >
            {edges.map((e, i) => (
              <line
                key={i}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="#4B5563"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            ))}
          </svg>

          {/* 노드 블록 */}
          {Array.from({ length: size }, (_, i) => i + 1).map((idx) => {
            const lb = lowbit(idx);
            const levelNum = Math.log2(lb);
            if (!Number.isInteger(levelNum)) return null;
            const level = Math.round(levelNum);
            const { left, width } = xPos(idx);
            const top = svgHeight - (level + 1) * rowH;
            const [start, end] = getResponsibleRange(idx);
            const isHighlighted = highlightSet.has(idx);

            let bgColor = "bg-gray-700 border-gray-600 text-gray-200";
            if (isHighlighted) {
              bgColor =
                highlightType === "update"
                  ? "bg-orange-500 border-orange-400 text-white"
                  : "bg-teal-500 border-teal-400 text-white";
            }

            return (
              <motion.div
                key={idx}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width,
                  height: cellH,
                }}
                animate={isHighlighted ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`rounded border flex flex-col items-center justify-center ${bgColor} transition-colors cursor-default`}
                title={`tree[${idx}] = ${tree[idx] ?? 0}  담당: [${start}, ${end}]`}
              >
                <span className="text-xs font-bold font-mono">{tree[idx] ?? 0}</span>
                <span className="text-xs opacity-70">i={idx}</span>
              </motion.div>
            );
          })}

          {/* 인덱스 눈금 (아래) */}
          {Array.from({ length: size }, (_, i) => i + 1).map((idx) => {
            const left = (idx - 1) * (cellW + gapX) + paddingX + cellW / 2;
            return (
              <div
                key={idx}
                style={{ position: "absolute", left: left - 10, top: svgHeight - 18, width: 20 }}
                className="text-center text-gray-500 text-xs"
              >
                {idx}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
