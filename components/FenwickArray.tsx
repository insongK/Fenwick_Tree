"use client";

import { motion } from "framer-motion";
import { getResponsibleRange } from "@/lib/fenwick";

interface Props {
  original: number[];  // 1-based (index 0 미사용)
  tree: number[];      // 1-based
  size: number;
  highlightIndices: number[]; // 현재 하이라이트할 인덱스들 (1-based)
  highlightType: "update" | "query" | "none";
}

const CELL_W = 52;

export default function FenwickArray({
  original,
  tree,
  size,
  highlightIndices,
  highlightType,
}: Props) {
  const highlightSet = new Set(highlightIndices);

  const cellColor = (idx: number, isTree: boolean) => {
    if (!isTree) return "bg-gray-700 border-gray-600";
    if (highlightSet.has(idx)) {
      return highlightType === "update"
        ? "bg-orange-500 border-orange-400 text-white"
        : "bg-teal-500 border-teal-400 text-white";
    }
    return "bg-gray-700 border-gray-600";
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold text-white">배열 시각화</h2>

      {/* 원본 배열 */}
      <div>
        <p className="text-gray-400 text-xs mb-2">원본 배열 a[]</p>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: size }, (_, i) => i + 1).map((idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-gray-500 text-xs">{idx}</span>
              <motion.div
                layout
                className={`w-12 h-10 flex items-center justify-center rounded border text-sm font-mono font-semibold bg-gray-700 border-gray-600 text-gray-200`}
              >
                {original[idx] ?? 0}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* BIT 배열 */}
      <div>
        <p className="text-gray-400 text-xs mb-2">팬윅 트리 배열 tree[]</p>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: size }, (_, i) => i + 1).map((idx) => {
            const [start, end] = getResponsibleRange(idx);
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-gray-500 text-xs">{idx}</span>
                <motion.div
                  layout
                  animate={
                    highlightSet.has(idx)
                      ? { scale: [1, 1.15, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                  className={`w-12 h-10 flex items-center justify-center rounded border text-sm font-mono font-semibold transition-colors ${cellColor(idx, true)}`}
                  title={`담당 범위: [${start}, ${end}]`}
                >
                  {tree[idx] ?? 0}
                </motion.div>
                <span className="text-gray-600 text-xs">
                  [{start},{end}]
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex gap-4 text-xs text-gray-400 pt-1 border-t border-gray-700">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-500 inline-block" />
          Update 경로
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-teal-500 inline-block" />
          Query 경로
        </span>
        <span className="text-gray-500">(셀 하단 = 담당 범위)</span>
      </div>
    </div>
  );
}
