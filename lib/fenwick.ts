export interface Step {
  type: "update" | "query";
  index: number;       // 현재 방문 인덱스 (1-based)
  bitValue: number;    // tree[index] 현재 값
  lowbit: number;      // lowbit(index)
  delta?: number;      // update일 때 더하는 값
  accumulated?: number; // query일 때 누적 합
  description: string;
}

export interface FenwickState {
  original: number[];  // 원본 배열 (1-based, index 0은 미사용)
  tree: number[];      // BIT 배열 (1-based)
  size: number;
}

/** lowbit 계산 */
export function lowbit(x: number): number {
  return x & -x;
}

/** 원본 배열로 BIT 초기화 */
export function buildFenwick(arr: number[]): FenwickState {
  const n = arr.length;
  const original = [0, ...arr]; // 1-based
  const tree = new Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    tree[i] += original[i];
    const parent = i + lowbit(i);
    if (parent <= n) tree[parent] += tree[i];
  }

  return { original, tree, size: n };
}

/** update 연산의 step 목록 반환 */
export function getUpdateSteps(
  state: FenwickState,
  pos: number,
  delta: number
): { steps: Step[]; newState: FenwickState } {
  const tree = [...state.tree];
  const original = [...state.original];
  const n = state.size;
  const steps: Step[] = [];

  original[pos] += delta;
  let i = pos;

  while (i <= n) {
    const lb = lowbit(i);
    steps.push({
      type: "update",
      index: i,
      bitValue: tree[i],
      lowbit: lb,
      delta,
      description: `tree[${i}] += ${delta}  (lowbit(${i}) = ${i} & ${-i} = ${lb}, 다음: ${i} + ${lb} = ${i + lb})`,
    });
    tree[i] += delta;
    i += lb;
  }

  return {
    steps,
    newState: { original, tree, size: n },
  };
}

/** prefix sum query 연산의 step 목록 반환 */
export function getQuerySteps(
  state: FenwickState,
  pos: number
): { steps: Step[]; result: number } {
  const tree = state.tree;
  const steps: Step[] = [];
  let sum = 0;
  let i = pos;

  while (i > 0) {
    const lb = lowbit(i);
    sum += tree[i];
    steps.push({
      type: "query",
      index: i,
      bitValue: tree[i],
      lowbit: lb,
      accumulated: sum,
      description: `sum += tree[${i}] = ${tree[i]}  → 누적합: ${sum}  (lowbit(${i}) = ${lb}, 다음: ${i} - ${lb} = ${i - lb})`,
    });
    i -= lb;
  }

  return { steps, result: sum };
}

/** range query [l, r] 를 두 prefix query로 분해 */
export function getRangeQuerySteps(
  state: FenwickState,
  l: number,
  r: number
): {
  stepsR: Step[];
  stepsL: Step[];
  resultR: number;
  resultL: number;
  result: number;
} {
  const { steps: stepsR, result: resultR } = getQuerySteps(state, r);
  const { steps: stepsL, result: resultL } = getQuerySteps(state, l - 1);
  return {
    stepsR,
    stepsL,
    resultR,
    resultL,
    result: resultR - resultL,
  };
}

/** 각 인덱스가 담당하는 범위 반환 [start, end] (1-based) */
export function getResponsibleRange(index: number): [number, number] {
  const lb = lowbit(index);
  return [index - lb + 1, index];
}
