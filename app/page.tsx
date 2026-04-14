"use client";

import { useState } from "react";
import ArrayInput from "@/components/ArrayInput";
import FenwickArray, { OperationType } from "@/components/FenwickArray";
import TreeVisualizer from "@/components/TreeVisualizer";
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

  const highlightIndices =
    currentStep >= 0 && currentStep < steps.length
      ? [steps[currentStep].index]
      : [];
  const highlightType =
    currentStep >= 0 && currentStep < steps.length
      ? steps[currentStep].type
      : "none";

  const resetSteps = () => {
    setSteps([]);
    setCurrentStep(-1);
    setResult(null);
    setOpLabel("");
  };

  const handleBuild = (arr: number[]) => {
    setFenwick(buildFenwick(arr));
    resetSteps();
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
      setSteps([...stepsR, ...stepsL]);
      setCurrentStep(0);
      setResult(res);
      setOpLabel(`rangeSum(${l} ~ ${r})`);
    }
  };

  const handlePrev = () => setCurrentStep((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentStep((p) => Math.min(steps.length, p + 1));
  const handleReset = () => setCurrentStep(0);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Fenwick Tree <span className="text-blue-400">Simulator</span>
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Binary Indexed Tree (BIT) 시각화 & 단계별 시뮬레이터
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <ArrayInput onBuild={handleBuild} />
          </div>
          <div className="lg:col-span-2">
            <StepExplainer
              steps={steps}
              currentStep={currentStep}
              totalSteps={steps.length}
              result={result}
              opLabel={opLabel}
              onPrev={handlePrev}
              onNext={handleNext}
              onReset={handleReset}
            />
          </div>
        </div>

        {fenwick ? (
          <div className="space-y-4">
            <FenwickArray
              original={fenwick.original}
              tree={fenwick.tree}
              size={fenwick.size}
              highlightIndices={highlightIndices}
              highlightType={highlightType as "update" | "query" | "none"}
              onOperate={handleOperate}
            />
            <TreeVisualizer
              tree={fenwick.tree}
              size={fenwick.size}
              highlightIndices={highlightIndices}
              highlightType={highlightType as "update" | "query" | "none"}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-700 rounded-xl text-gray-500">
            배열을 설정하고 트리 빌드 버튼을 눌러 시작하세요.
          </div>
        )}
      </main>
    </div>
  );
}
