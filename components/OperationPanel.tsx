"use client";

import { useState } from "react";

export type OperationType = "update" | "prefix" | "range";

interface Props {
  size: number;
  disabled: boolean;
  onOperate: (op: OperationType, params: number[]) => void;
}

export default function OperationPanel({ size, disabled, onOperate }: Props) {
  const [opType, setOpType] = useState<OperationType>("prefix");
  const [pos, setPos] = useState(1);
  const [delta, setDelta] = useState(1);
  const [rangeL, setRangeL] = useState(1);
  const [rangeR, setRangeR] = useState(size);

  const handleRun = () => {
    if (opType === "update") onOperate("update", [pos, delta]);
    else if (opType === "prefix") onOperate("prefix", [pos]);
    else onOperate("range", [rangeL, rangeR]);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold text-white">연산</h2>

      {/* 연산 종류 선택 */}
      <div className="flex gap-2">
        {(["update", "prefix", "range"] as OperationType[]).map((t) => (
          <button
            key={t}
            onClick={() => setOpType(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              opType === t
                ? t === "update"
                  ? "bg-orange-600 text-white"
                  : "bg-teal-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {t === "update" ? "Point Update" : t === "prefix" ? "Prefix Sum" : "Range Query"}
          </button>
        ))}
      </div>

      {/* 파라미터 입력 */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
        {opType === "update" && (
          <>
            <div className="flex items-center gap-2">
              <label>위치 i</label>
              <input
                type="number"
                min={1}
                max={size}
                value={pos}
                onChange={(e) => setPos(parseInt(e.target.value, 10))}
                className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label>delta</label>
              <input
                type="number"
                value={delta}
                onChange={(e) => setDelta(parseInt(e.target.value, 10))}
                className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <span className="text-gray-500 font-mono">
              update({pos}, {delta})
            </span>
          </>
        )}
        {opType === "prefix" && (
          <>
            <div className="flex items-center gap-2">
              <label>위치 i</label>
              <input
                type="number"
                min={1}
                max={size}
                value={pos}
                onChange={(e) => setPos(parseInt(e.target.value, 10))}
                className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-gray-500 font-mono">query(1 ~ {pos})</span>
          </>
        )}
        {opType === "range" && (
          <>
            <div className="flex items-center gap-2">
              <label>L</label>
              <input
                type="number"
                min={1}
                max={size}
                value={rangeL}
                onChange={(e) => setRangeL(parseInt(e.target.value, 10))}
                className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label>R</label>
              <input
                type="number"
                min={1}
                max={size}
                value={rangeR}
                onChange={(e) => setRangeR(parseInt(e.target.value, 10))}
                className="w-16 bg-gray-700 text-white rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-gray-500 font-mono">
              query({rangeL} ~ {rangeR})
            </span>
          </>
        )}
      </div>

      <button
        onClick={handleRun}
        disabled={disabled}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg font-semibold transition-colors"
      >
        실행
      </button>
    </div>
  );
}
