import { CPUS } from "./cpus.js";
import { GPUS } from "./gpus.js";

export function calculateBottleneck(cpuId, gpuId) {
  const cpu = CPUS.find(c => c.id === cpuId);
  const gpu = GPUS.find(g => g.id === gpuId);

  if (!cpu || !gpu) return "Bileşen bulunamadı.";

  const diff = cpu.level - gpu.level;

  if (diff >= 2) return "GPU darboğaz yapıyor.";
  if (diff <= -2) return "CPU darboğaz yapıyor.";
  return "Sistem dengeli.";
}