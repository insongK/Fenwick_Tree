"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ArrayInput from "@/components/ArrayInput";
import FenwickArray from "@/components/FenwickArray";
import TreeVisualizer from "@/components/TreeVisualizer";
import OperationPanel, { OperationType } from "@/components/OperationPanel";
import StepExplainer from "@/components/StepExplainer";
import {
  buildFenwick,
  FenwickState,
  getUpdateSteps,
  getQuerySteps,
  getRangeQuerySteps,
  Step,
} from "@/lib/fenwick";

export default function Home() {
  const [fenwick, setFenwick] = useState<FenwickState | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState<number | null>(null);
  const [opLabel, setOpLabel] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const playRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 하이라이트: 현재 스텝의 인덱스
  const highlightIndices =
    currentStep >= 0 && currentStep < steps.length
      ? [steps[currentStep].index]
      : [];
  const highlightType =
    currentStep >= 0 && currentStep < steps.length
      ? steps[currentStep].type
      : "none";

  const handleBuild = (arr: number[]) => {
    const state = buildFenwick(arr);
    setFenwick(state);
    resetSteps();
  };

  const resetSteps = () => {
    setSteps([]);
    setCurrentStep(-1);
    setResult(null);
    setOpLabel("");
    setIsPlaying(false);
    if (playRef.current) clearTimeout(playRef.current);
  };

  const handleOperate = (op: OperationType, params: number[]) => {
    if (!fenwick) return;
    resetSteps();

    if (op === "update") {
      const [pos, delta] = params;
      const { steps: s, newState } = getUpdateSteps(fenwick, pos, delta);
      setSteps(s);
      setCurrentStep(0);
      setFenwick(newState);
      setResult(null);
      setOpLabel(`update(${pos}, ${delta > 0 ? "+" : ""}${delta})`);
    } else if (op === "prefix") {
      const [pos] = params;
      const { steps: s, result: r } = getQuerySteps(fenwick, pos);
      setSteps(s);
      setCurrentStep(0);
      setResult(r);
      setOpLabel(`prefixSum(1 ~ ${pos})`);
    } else {
      const [l, r] = params;
      const { stepsR, stepsL, result: res } = getRangeQuerySteps(fenwick, l, r);
      // range query: R query 먼저 → L-1 query
      const combined = [...stepsR, ...stepsL];
      setSteps(combined);
      setCurrentStep(0);
      setResult(res);
      setOpLabel(`rangeSum(${l} ~ ${r})`);
    }
  };

  // 자동 재생
  const playNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev + 1 >= steps.length) {
        setIsPlaying(false);
        return prev + 1; // "done" 상태
      }
      return prev + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!isPlaying) {
      if (playRef.current) clearTimeout(playRef.current);
      return;
    }
    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }
    playRef.current = setTimeout(playNext, speed);
    return () => {
      if (playRef.current) clearTimeout(playRef.current);
    };
  }, [isPlaying, currentStep, steps.length, speed, playNext]);

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((p) => Math.max(0, p - 1));
  };
  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((p) => Math.min(steps.length, p + 1));
  };
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <header className="border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Fenwick Tree{" "}
          <span className="text-blue-400">Simulator</span>
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Binary Indexed Tree (BIT) 시각화 & 단계별 시뮬레이터
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* 상단: 배열 설정 + 연산 + 스텝 설명 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-4">
            <ArrayInput onBuild={handleBuild} />
            <OperationPanel
              size={fenwick?.size ?? 8}
              disabled={!fenwick}
              onOperate={handleOperate}
            />
          </div>
          <div className="lg:col-span-2">
            <StepExplainer
              steps={steps}
              currentStep={currentStep}
              totalSteps={steps.length}
              isPlaying={isPlaying}
              speed={speed}
              result={result}
              opLabel={opLabel}
              onPrev={handlePrev}
              onNext={handleNext}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
              onSpeedChange={setSpeed}
            />
          </div>
        </div>

        {/* 하단: 배열 시각화 + 트리 구조 */}
        {fenwick && (
          <div className="space-y-4">
            <FenwickArray
              original={fenwick.original}
              tree={fenwick.tree}
              size={fenwick.size}
              highlightIndices={highlightIndices}
              highlightType={highlightType as "update" | "query" | "none"}
            />
            <TreeVisualizer
              tree={fenwick.tree}
              size={fenwick.size}
              highlightIndices={highlightIndices}
              highlightType={highlightType as "update" | "query" | "none"}
            />
          </div>
        )}

        {!fenwick && (
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-xl text-gray-500">
            배열을 설정하고 트리 빌드 버튼을 눌러 시작하세요.
          </div>
        )}
      </main>
    </div>
  );
}
