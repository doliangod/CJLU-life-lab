import { course } from '../data/course';

export const PROGRESS_KEY = 'university-life-lab.progress.v1';
export const COURSE_VERSION = 'metering-2026-v1.1';
export interface SavedProgress {
  version: 1;
  courseVersion: string;
  unitId: string;
  stepId: string;
  selections: Record<string, string[]>;
  confirmed: string[];
  elapsedSeconds: number;
  timerVisible: boolean;
  savedAt: number;
}
const steps = course.flatMap(unit => unit.subSteps.map(step => ({unit, step, key:`${unit.id}/${step.id}`})));
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));

export function parseProgress(raw: string): SavedProgress | null {
  try {
    if (raw.length > 64000) return null;
    const value: unknown = JSON.parse(raw);
    if (!isObject(value) || value.version !== 1 || value.courseVersion !== COURSE_VERSION ||
        !isObject(value.selections) || !Array.isArray(value.confirmed) ||
        !Number.isInteger(value.elapsedSeconds) || Number(value.elapsedSeconds) < 0 || Number(value.elapsedSeconds) > 604800 ||
        typeof value.timerVisible !== 'boolean' || typeof value.savedAt !== 'number' || !Number.isFinite(value.savedAt)) return null;
    // Preserve completed sessions saved before the closing pages were merged.
    if (value.unitId === 'final' && value.stepId === 'ending') value.stepId = 'thirty-days';
    const cursor = steps.findIndex(({unit,step}) => unit.id === value.unitId && step.id === value.stepId);
    if (cursor < 0 || value.confirmed.length > 7 || new Set(value.confirmed).size !== value.confirmed.length) return null;
    const selections: Record<string,string[]> = {};
    for (const [key, selection] of Object.entries(value.selections)) {
      const interaction = steps.find(item => item.key === key)?.step.interaction;
      if (!interaction || !Array.isArray(selection) || selection.length > (interaction.maxSelections ?? 1) ||
          new Set(selection).size !== selection.length || !selection.every(id => typeof id === 'string' && interaction.options.some(option => option.id === id))) return null;
      selections[key] = selection;
    }
    for (const key of value.confirmed) {
      if (typeof key !== 'string') return null;
      const interaction = steps.find(item => item.key === key)?.step.interaction;
      if (!interaction || selections[key]?.length !== (interaction.maxSelections ?? 1)) return null;
    }
    // A saved cursor cannot skip a question that was never confirmed. Drafts
    // and later answers are retained when a teacher edits an earlier question.
    const confirmed = value.confirmed as string[];
    if (steps.slice(0,cursor).some(({step,key}) => step.interaction && !confirmed.includes(key))) return null;
    return {version:1,courseVersion:COURSE_VERSION,unitId:String(value.unitId),stepId:String(value.stepId),selections,
      confirmed:value.confirmed as string[],elapsedSeconds:Number(value.elapsedSeconds),timerVisible:value.timerVisible,savedAt:value.savedAt};
  } catch { return null; }
}

export function readProgress(): {progress:SavedProgress|null; storageAvailable:boolean; notice:string} {
  if (typeof window === 'undefined') return {progress:null,storageAvailable:true,notice:''};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    const progress = raw ? parseProgress(raw) : null;
    if (raw && !progress) window.localStorage.removeItem(PROGRESS_KEY);
    return {progress,storageAvailable:true,notice:raw&&!progress?'上次保存的进度无法恢复，已从首页开始。':''};
  } catch { return {progress:null,storageAvailable:false,notice:'当前浏览器无法保存本机进度。'}; }
}

export function writeProgress(progress: SavedProgress | null): boolean {
  if (typeof window === 'undefined') return true;
  try {
    if (progress) window.localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));
    else window.localStorage.removeItem(PROGRESS_KEY);
    return true;
  } catch { return false; }
}
