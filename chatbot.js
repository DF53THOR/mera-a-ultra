import { calculateBottleneck } from "./analyzer.js";

function handleAnalyze(cpuId, gpuId) {
  const result = calculateBottleneck(cpuId, gpuId);
  displayMessage(result);
}