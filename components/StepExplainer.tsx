"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Step } from "@/lib/fenwick";

interface Props {
  steps: Step[];
  currentStep: number;
  totalSteps: number;
  result: number | null;
  opLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}

const BITS = 8;

function BitCell({
  bit,
  highlighted,
}: {
  bit: string;
  highlighted: boolean;
}) {
  return (
    <span
      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold border font-mono transition-colors ${
        highlighted
          ? "bg-purple-600 border-purple-400 text-white"
          : bit === "1"
          ? "bg-gray-600 border-gray-500 text-gray-100"
          : "bg-gray-800 border-gray-700 text-gray-600"
      }`}
    >
      {bit}
    </span>
  );
}

function BitRow({
  label,
  value,
  lowbitPos,
  accentColor = "text-gray-300",
}: {
  label: string;
  value: number;
  lowbitPos: number;
  accentColor?: string;
}) {
  // 8-bit display (unsigned)
  const unsigned = value < 0 ? (value + 256) & 0xff : value & 0xff;
  const binary = unsigned.toString(2).padStart(BITS, "0");

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-400 w-14 text-right text-xs font-mono shrink-0">
        {label}
      </span>
      <div className="flex gap-0.5">
        {binary.split("").map((bit, i) => {
          const posFromRight = BITS - 1 - i;
          return (
            <BitCell key={i} bit={bit} highlighted={posFromRight === lowbitPos} />
          );
        })}
      </div>
      <span className={`text-xs font-mono ${accentColor}`}>= {value}</span>
    </div>
  );
}

function BitDisplay({ index, lb }: { index: number; lb: number }) {
  const lowbitPos = Math.round(Math.log2(lb)); // which bit position (from right)

  return (
    <div className="space-y-1.5">
      <BitRow label="i" value={index} lowbitPos={lowbitPos} accentColor="text-yellow-300" />
      <BitRow label="-i" value={-index} lowbitPos={lowbitPos} accentColor="text-gray-400" />
      {/* divider */}
      <div className="flex items-center gap-2">
        <span className="w-14 text-right text-xs text-gray-600 shrink-0">i &amp; -i</span>
        <div className="flex-1 h-px bg-gray-600" />
      </div>
      <BitRow
        label="lowbit"
        value={lb}
        lowbitPos={lowbitPos}
        accentColor="text-purple-300"
      />
      <p className="text-gray-500 text-xs ml-16">
        = {index} &amp; {-index} = <span className="text-purple-300 font-semibold">{lb}</span>
        {"  "}
        <span className="text-gray-600">
          (비트 위치 {lowbitPos}, 담당 범위 {lb}칸)
        </span>
      </p>
    </div>
  );
}

export default function StepExplainer({
  steps,
  currentStep,
  totalSteps,
  result,
  opLabel,
  onPrev,
  onNext,
  onReset,
}: Props) {
  const step = steps[currentStep] ?? null;
  const isDone = currentStep >= totalSteps && totalSteps > 0;
  const isUpdate = step?.type === "update";
  const accentClass = isUpdate ? "text-orange-400" : "text-teal-400";
  const barColor = isUpdate ? "bg-orange-500" : "bg-teal-500";

  const nextIndex = step
    ? isUpdate
      ? step.index + step.lowbit
      : step.index - step.lowbit
    : null;

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-4">
      {/* 헤더 */}
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
            <span>
              Step {Math.min(currentStep + 1, totalSteps)} / {totalSteps}
            </span>
            {isDone && result !== null && (
              <span className="text-green-400 font-semibold">결과: {result}</span>
            )}
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full">
            <div
              className={`h-1.5 rounded-full transition-all ${barColor}`}
              style={{
                width: `${
                  totalSteps > 0
                    ? (Math.min(currentStep + 1, totalSteps) / totalSteps) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 메인 설명 영역 */}
      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-900 rounded-lg p-4 text-center space-y-1"
          >
            <p className="text-green-400 font-semibold text-sm">연산 완료</p>
            {result !== null && (
              <p className="text-white text-3xl font-bold font-mono">{result}</p>
            )}
          </motion.div>
        ) : step ? (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-gray-900 rounded-lg p-4 space-y-4"
          >
            {/* 연산 타입 뱃지 + 인덱스 */}
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  isUpdate
                    ? "bg-orange-600 text-white"
                    : "bg-teal-600 text-white"
                }`}
              >
                {isUpdate ? "UPDATE" : "QUERY"}
              </span>
              <span className="text-gray-300 text-sm">
                현재 인덱스{" "}
                <span className={`font-bold font-mono text-base ${accentClass}`}>
                  i = {step.index}
                </span>
              </span>
            </div>

            {/* 비트 연산 시각화 */}
            <BitDisplay index={step.index} lb={step.lowbit} />

            {/* 이번 스텝에서 하는 일 */}
            <div className="border-t border-gray-700 pt-3 space-y-1 text-sm font-mono">
              {isUpdate ? (
                <>
                  <p>
                    <span className="text-orange-400">tree[{step.index}]</span>
                    <span className="text-gray-300"> += </span>
                    <span className="text-yellow-300">{step.delta}</span>
                    <span className="text-gray-500">
                      {"  "}({step.bitValue} → {step.bitValue + (step.delta ?? 0)})
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    i += lowbit(i) ={" "}
                    <span className="text-yellow-300">{step.index}</span> +{" "}
                    <span className="text-purple-300">{step.lowbit}</span> ={" "}
                    <span className={nextIndex && nextIndex <= 1024 ? "text-gray-200" : "text-gray-500"}>
                      {nextIndex}
                    </span>
                    {nextIndex && nextIndex > 1024 ? "  (범위 초과 → 종료)" : "  (다음 스텝)"}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <span className="text-gray-300">sum += </span>
                    <span className="text-teal-400">tree[{step.index}]</span>
                    <span className="text-gray-300"> = </span>
                    <span className="text-yellow-300">{step.bitValue}</span>
                    <span className="text-gray-500">
                      {"  "}(누적:{" "}
                      <span className="text-teal-300">{step.accumulated}</span>)
                    </span>
                  </p>
                  <p className="text-gray-500 text-xs">
                    i -= lowbit(i) ={" "}
                    <span className="text-yellow-300">{step.index}</span> -{" "}
                    <span className="text-purple-300">{step.lowbit}</span> ={" "}
                    <span className={nextIndex === 0 ? "text-gray-500" : "text-gray-200"}>
                      {nextIndex}
                    </span>
                    {nextIndex === 0 ? "  (i=0 → 종료)" : "  (다음 스텝)"}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900 rounded-lg p-4 text-center text-gray-500 text-sm"
          >
            배열을 클릭해 연산을 실행하세요.
          </motion.div>
        )}
      </AnimatePresence>

      {/* 컨트롤 */}
      {totalSteps > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
          >
            처음
          </button>
          <button
            onClick={onPrev}
            disabled={currentStep <= 0}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors"
          >
            ◀ 이전
          </button>
          <button
            onClick={onNext}
            disabled={isDone}
            className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-gray-300 text-sm rounded-lg transition-colors"
          >
            다음 ▶
          </button>
        </div>
      )}
    </div>
  );
}
