"use client";

import { useState } from "react";

interface Props {
  onBuild: (arr: number[]) => void;
}

export default function ArrayInput({ onBuild }: Props) {
  const [size, setSize] = useState(8);
  const [values, setValues] = useState<string[]>(Array(8).fill("0"));

  const handleSizeChange = (n: number) => {
    const clamped = Math.max(1, Math.min(16, n));
    setSize(clamped);
    setValues((prev) => {
      const next = Array(clamped).fill("0");
      for (let i = 0; i < Math.min(prev.length, clamped); i++) {
        next[i] = prev[i];
      }
      return next;
    });
  };

  const handleValueChange = (i: number, val: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const handleRandom = () => {
    setValues(Array(size).fill(0).map(() => String(Math.floor(Math.random() * 20) + 1)));
  };

  const handleBuild = () => {
    const arr = values.map((v) => parseInt(v, 10) || 0);
    onBuild(arr);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold text-white">배열 설정</h2>

      {/* 크기 설정 */}
      <div className="flex items-center gap-3">
        <label className="text-gray-300 text-sm w-20">크기 (N)</label>
        <input
          type="number"
          min={1}
          max={16}
          value={size}
          onChange={(e) => handleSizeChange(parseInt(e.target.value, 10))}
          className="w-20 bg-gray-700 text-white rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500 text-xs">(최대 16)</span>
      </div>

      {/* 값 입력 */}
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-gray-400 text-xs">a[{i + 1}]</span>
            <input
              type="number"
              value={v}
              onChange={(e) => handleValueChange(i, e.target.value)}
              className="w-12 bg-gray-700 text-white rounded px-1 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={handleRandom}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
        >
          랜덤 생성
        </button>
        <button
          onClick={handleBuild}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors font-semibold"
        >
          트리 빌드
        </button>
      </div>
    </div>
  );
}
