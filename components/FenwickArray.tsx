"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getResponsibleRange } from "@/lib/fenwick";

export type OperationType = "update" | "prefix" | "range";

interface Props {
  original: number[];
  tree: number[];
  size: number;
  highlightIndices: number[];
  highlightType: "update" | "query" | "none";
  onOperate: (op: OperationType, params: number[]) => void;
}

export default function FenwickArray({
  original,
  tree,
  size,
  highlightIndices,
  highlightType,
  onOperate,
}: Props) {
  const [opType, setOpType] = useState<OperationType>("prefix");
  const [selected, setSelected] = useState<number[]>([]);
  const [delta, setDelta] = useState(1);

  const highlightSet = new Set(highlightIndices);
  const selectedSet = new Set(selected);
  const maxSelections = opType === "range" ? 2 : 1;

  const handleOpTypeChange = (t: OperationType) => {
    setOpType(t);
    setSelected([]);
  };

  const handleCellClick = (idx: number) => {
    setSelected((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= maxSelections) {
        return maxSelections === 1 ? [idx] : [...prev.slice(1), idx];
      }
      return [...prev, idx];
    });
  };

  const canRun = opType === "range" ? selected.length === 2 : selected.length === 1;

  const handleRun = () => {
    if (!canRun) return;
    if (opType === "update") {
      onOperate("update", [selected[0], delta]);
    } else if (opType === "prefix") {
      onOperate("prefix", [selected[0]]);
    } else {
      const l = Math.min(...selected);
      const r = Math.max(...selected);
      onOperate("range", [l, r]);
    }
    setSelected([]);
  };

  const previewLabel = () => {
    if (opType === "update" && selected.length === 1)
      return `update(${selected[0]}, ${delta >= 0 ? "+" : ""}${delta})`;
    if (opType === "prefix" && selected.length === 1)
      return `prefixSum(1 ~ ${selected[0]})`;
    if (opType === "range" && selected.length === 2) {
      const l = Math.min(...selected);
      const r = Math.max(...selected);
      return `rangeSum(${l} ~ ${r})`;
    }
    if (opType === "range" && selected.length === 1)
      return `${selected[0]} 선택됨 — 두 번째 위치를 클릭하세요`;
    return opType === "range"
      ? "L, R 위치를 클릭하세요"
      : "위치를 클릭하세요";
  };

  const originalCellColor = (idx: number) => {
    if (selectedSet.has(idx))
      return "bg-blue-600 border-blue-400 text-white cursor-pointer hover:bg-blue-500";
    return "bg-gray-700 border-gray-600 text-gray-200 cursor-pointer hover:bg-gray-600";
  };

  const treeCellColor = (idx: number) => {
    if (selectedSet.has(idx))
      return "bg-blue-600 border-blue-400 text-white";
    if (highlightSet.has(idx)) {
      return highlightType === "update"
        ? "bg-orange-500 border-orange-400 text-white"
        : "bg-teal-500 border-teal-400 text-white";
    }
    return "bg-gray-700 border-gray-600 text-gray-200";
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      {/* 헤더 + 연산 타입 선택 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">배열 시각화</h2>
        <div className="flex gap-2">
          {(["update", "prefix", "range"] as OperationType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleOpTypeChange(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                opType === t
                  ? t === "update"
                    ? "bg-orange-600 text-white"
                    : "bg-teal-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {t === "update"
                ? "Point Update"
                : t === "prefix"
                ? "Prefix Sum"
                : "Range Query"}
            </button>
          ))}
        </div>
      </div>

      {/* 원본 배열 — 클릭으로 위치 선택 */}
      <div>
        <p className="text-gray-400 text-xs mb-2">
          원본 배열 a[]{" "}
          <span className="text-blue-400">— 클릭하여 위치 선택</span>
        </p>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: size }, (_, i) => i + 1).map((idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <span className="text-gray-500 text-xs">{idx}</span>
              <motion.div
                layout
                onClick={() => handleCellClick(idx)}
                animate={selectedSet.has(idx) ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`w-12 h-10 flex items-center justify-center rounded border text-sm font-mono font-semibold transition-colors select-none ${originalCellColor(idx)}`}
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
                    highlightSet.has(idx) ? { scale: [1, 1.15, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.3 }}
                  className={`w-12 h-10 flex items-center justify-center rounded border text-sm font-mono font-semibold transition-colors ${treeCellColor(idx)}`}
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

      {/* 연산 실행 바 */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-700">
        <span className="text-sm text-gray-400 font-mono flex-1 min-w-0 truncate">
          {previewLabel()}
        </span>
        {opType === "update" && selected.length === 1 && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <label>delta</label>
            <input
              type="number"
              value={delta}
              onChange={(e) => setDelta(parseInt(e.target.value, 10) || 0)}
              className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}
        <button
          onClick={handleRun}
          disabled={!canRun}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg font-semibold transition-colors"
        >
          연산 시작
        </button>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-1 border-t border-gray-700">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
          선택된 위치
        </span>
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
