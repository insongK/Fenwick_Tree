"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Step } from "@/lib/fenwick";

interface Props {
  steps: Step[];
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  result: number | null;
  opLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (s: number) => void;
}

export default function StepExplainer({
  steps,
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  result,
  opLabel,
  onPrev,
  onNext,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
}: Props) {
  const step = steps[currentStep] ?? null;
  const isDone = currentStep >= totalSteps;

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">단계별 설명</h2>
        {opLabel && (
          <span className="text-xs bg-gray-700 text-gray-300 rounded px-2 py-1 font-mono">
            {opLabel}
          </span>
        )}
      </div>

      {/* 진행 바 */}
      {totalSteps > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Step {Math.min(currentStep + 1, totalSteps)} / {totalSteps}</span>
            {isDone && result !== null && (
              <span className="text-green-400 font-semibold">결과: {result}</span>
            )}
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full">
            <div
              className={`h-2 rounded-full transition-all ${
                step?.type === "update" ? "bg-orange-500" : "bg-teal-500"
              }`}
              style={{ width: `${totalSteps > 0 ? (Math.min(currentStep + 1, totalSteps) / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* 현재 스텝 설명 */}
      <div className="min-h-[80px] bg-gray-900 rounded-lg p-3">
        <AnimatePresence mode="wait">
          {isDone && result !== null ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-400 font-semibold text-sm"
            >
              연산 완료! 결과: <span className="text-xl">{result}</span>
            </motion.div>
          ) : step ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className="text-gray-200 text-sm">{step.description}</p>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-gray-400">
                  인덱스: <span className="text-yellow-400">{step.index}</span>
                </span>
                <span className="text-gray-400">
                  lowbit: <span className="text-purple-400">{step.lowbit}</span>{" "}
                  <span className="text-gray-600">
                    (이진수: {step.index.toString(2).padStart(4, "0")} →{" "}
                    {step.lowbit.toString(2).padStart(4, "0")})
                  </span>
                </span>
                {step.accumulated !== undefined && (
                  <span className="text-gray-400">
                    누적합: <span className="text-teal-400">{step.accumulated}</span>
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              className="text-gray-500 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              연산을 선택하고 실행하세요.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* 컨트롤 버튼 */}
      {totalSteps > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
          >
            처음
          </button>
          <button
            onClick={onPrev}
            disabled={currentStep <= 0}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors"
          >
            ◀ 이전
          </button>
          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={isDone}
            className={`px-4 py-1.5 text-sm rounded-lg font-semibold transition-colors ${
              isPlaying
                ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                : "bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white"
            }`}
          >
            {isPlaying ? "⏸ 일시정지" : "▶ 재생"}
          </button>
          <button
            onClick={onNext}
            disabled={isDone}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors"
          >
            다음 ▶
          </button>

          {/* 속도 */}
          <div className="flex items-center gap-2 ml-2">
            <span className="text-gray-400 text-xs">속도</span>
            <input
              type="range"
              min={200}
              max={2000}
              step={200}
              value={2200 - speed}
              onChange={(e) => onSpeedChange(2200 - parseInt(e.target.value, 10))}
              className="w-20 accent-blue-500"
            />
            <span className="text-gray-400 text-xs">{speed}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
