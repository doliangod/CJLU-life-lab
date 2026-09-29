import assert from 'node:assert/strict';
import { course } from '../src/data/course';
import { useCourseStore as store, selectionKey } from '../src/store/courseStore';
import { COURSE_VERSION, parseProgress, type SavedProgress } from '../src/store/progressStorage';
const reset=()=>{store.getState().requestReset();store.getState().confirmReset();};
reset();
while(course[store.getState().unitIndex].subSteps[store.getState().stepIndex].id!=='priorities') {
 const state=store.getState(),step=course[state.unitIndex].subSteps[state.stepIndex];
 if(step.interaction)store.getState().selectOption(step.interaction.options[0].id);
 store.getState().nextStep();
}
store.getState().selectOption('content');store.getState().selectOption('safety');
const state=store.getState(),unit=course[state.unitIndex];
const snapshot:SavedProgress={version:1,courseVersion:COURSE_VERSION,unitId:unit.id,stepId:unit.subSteps[state.stepIndex].id,
 selections:structuredClone(state.selections),confirmed:Object.keys(state.confirmed),elapsedSeconds:42,timerVisible:true,savedAt:Date.now()};
assert.deepEqual(parseProgress(JSON.stringify(snapshot)),snapshot);
reset();store.setState({pendingRestore:snapshot});store.getState().selectOption('A');store.getState().nextStep();
assert.equal(store.getState().stepIndex,0,'恢复弹窗穿透');
store.getState().requestReset();store.getState().cancelReset();assert.ok(store.getState().pendingRestore);
store.getState().restoreProgress();
const restored=store.getState(),key=selectionKey(restored.unitIndex,restored.stepIndex);
assert.deepEqual(restored.selections[key],['content','safety']);assert.equal(restored.confirmed[key],undefined);
assert.equal(restored.elapsedSeconds,42);assert.equal(restored.timerVisible,true);assert.equal(restored.timerRunning,false);
assert.equal(restored.choiceHistory.length,2);assert.ok(restored.growth.keywords.includes('活动策划'));
store.getState().selectOption('schedule');store.getState().confirmInteraction();assert.equal(store.getState().choiceHistory.length,3);
const variations:unknown[]=[null,{}, {...snapshot,version:99},{...snapshot,courseVersion:'old'}, {...snapshot,unitId:'missing'},
 {...snapshot,stepId:'missing'}, {...snapshot,elapsedSeconds:-1}, {...snapshot,elapsedSeconds:1.1},
 {...snapshot,selections:{...snapshot.selections,[key]:['invalid']}},
 {...snapshot,selections:{...snapshot.selections,[key]:['content','content']}},
 {...snapshot,selections:{...snapshot.selections,[key]:['content','safety','schedule','publicity']}},
 {...snapshot,confirmed:[...snapshot.confirmed,key]}, {...snapshot,confirmed:['missing']},
 {...snapshot,confirmed:[snapshot.confirmed[0],snapshot.confirmed[0]]}, {...snapshot,unitId:'final',stepId:'resume'},
 {...snapshot,savedAt:'today'}];
for(const bad of variations)assert.equal(parseProgress(JSON.stringify(bad)),null);
assert.equal(parseProgress('{'),null);assert.equal(parseProgress('x'.repeat(65000)),null);
reset();assert.equal(store.getState().growth.completedExperiences,0);
console.log('通过：完整/草稿恢复、派生内容重建、计时暂停、取消重置及18种损坏/不兼容存档。');
