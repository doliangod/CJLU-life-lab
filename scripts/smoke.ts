import { parseProgress, COURSE_VERSION } from '../src/store/progressStorage';
import{course,totalRecommendedDuration}from'../src/data/course';
import{selectionKey,useCourseStore}from'../src/store/courseStore';
const assert=(value:unknown,message:string)=>{if(!value)throw new Error(message)};
assert(course.length===8,'必须包含Opening、6个Chapter和Final');
assert(course.filter(unit=>unit.kind==='chapter').length===6,'Chapter数量错误');
assert(totalRecommendedDuration===1320,'课程建议时长必须为22分钟');
const sceneIds=course.flatMap(unit=>unit.subSteps.map(step=>step.id));assert(sceneIds.length===33,'精简后页面数量错误');assert(!sceneIds.includes('major')&&!sceneIds.includes('dorm-ac'),'已删除页面仍存在于课程流程');
const radarFlow=course.flatMap(unit=>unit.subSteps).filter(step=>['challenge-intro','canteen-scale','parking-radar','curiosity'].includes(step.id));assert(radarFlow.map(step=>step.id).join(',')==='challenge-intro,canteen-scale,parking-radar,curiosity','专业体验衔接错误');assert(radarFlow.filter(step=>['canteen-scale','parking-radar'].includes(step.id)).every(step=>!step.interaction),'雷达静态页仍包含互动');
const interactionCount=course.reduce((sum,unit)=>sum+unit.subSteps.filter(step=>step.interaction).length,0);assert(interactionCount===7,'精简后互动数量错误');
type Choices = Record<string, string[]>;
const defaults: Choices = { participation: ['B'], 'campus-role': ['planning'], priorities: ['safety','schedule','materials'], crisis: ['C'], interest: ['C'], 'initial-tasks': ['collect','organize'], 'problem-solving': ['repeat','papers','teacher'] };
const store = useCourseStore;
function play(overrides: Choices = {}) {
 store.getState().requestReset(); store.getState().confirmReset();
 const choices = { ...defaults, ...overrides };
 for (let page = 0; page < sceneIds.length; page++) {
  const state = store.getState(), step = course[state.unitIndex].subSteps[state.stepIndex];
  if (step.interaction) {
   choices[step.id].forEach(id => store.getState().selectOption(id));
   if (step.interaction.type === 'multiple') store.getState().confirmInteraction();
   assert(store.getState().confirmed[selectionKey(state.unitIndex,state.stepIndex)], `互动未确认：${step.id}`);
  }
  store.getState().nextStep();
 }
 const completed = store.getState();
 assert(completed.choiceHistory.length === 7, '互动记录丢失或重复');
 assert(completed.campusExperience.completed && completed.projectExperience.completed, '完整路径缺失经历');
 assert([...completed.resumeProfile.campusExperiences, ...completed.resumeProfile.projects].every(x => typeof x === 'string' && x.length > 0), '简历有空白条目');
 assert(completed.resumeProfile.internships.length === 0 && completed.resumeProfile.skills.length === 0 && completed.resumeProfile.certificates.length === 0, '未体验的经历被虚构');
 assert(completed.resumeProfile.projects.every(x => !/(主导|核心算法|独立开发)/.test(x)), '个人职责被夸大');
 assert(completed.resumeProfile.awards[0].includes('课程情境·团队成果'), '团队情境奖项缺少说明');
 return completed;
}
function combinations(items: string[], count: number): string[][] {
 if (!count) return [[]];
 return items.flatMap((item, index) => combinations(items.slice(index + 1), count - 1).map(rest => [item, ...rest]));
}
const campusVersions = new Set<string>();
for (const participation of ['A','B','C','D']) {
 for (const role of ['planning','media','execution','hosting','logistics']) {
  for (const priorities of combinations(['content','publicity','safety','interaction','schedule','materials'], 3)) {
   for (const crisis of ['A','B','C','D']) {
    const state = play({ participation:[participation], 'campus-role':[role], priorities, crisis:[crisis] });
    assert(state.campusExperience.joinedOrganization === (participation === 'B'), '非组织路径被改写为组织成员');
    campusVersions.add(state.resumeProfile.campusExperiences.join(''));
   }
  }
 }
}
assert(campusVersions.size === 1600, '校园选择组合没有分别生成对应经历');
const projectVersions = new Set<string>();
const solutionMarkers: Record<string,string> = {repeat:'重复实验', papers:'查阅论文', ai:'使用AI', teacher:'请教指导老师', team:'与队友讨论', switch:'重新评估题目'};
const taskMarkers: Record<string,string> = {research:'查阅雷达感知相关资料',observe:'梳理停车场实际场景',record:'设计测试记录表',collect:'设计初步测试方案',organize:'采集并整理实验数据',discuss:'参与团队方案讨论'};
for (const interest of ['A','B','C']) {
 for (const tasks of combinations(Object.keys(taskMarkers), 2)) {
  for (const solutions of combinations(Object.keys(solutionMarkers), 3)) {
   const state = play({ interest:[interest], 'initial-tasks':tasks, 'problem-solving':solutions });
   const text = state.resumeProfile.projects.join('');
   for (const [id, marker] of Object.entries(taskMarkers)) assert(text.includes(marker) === tasks.includes(id), `初始任务不匹配：${id}`);
   for (const [id, marker] of Object.entries(solutionMarkers)) assert(text.includes(marker) === solutions.includes(id), `解决路线不匹配：${id}`);
   assert(state.projectExperience.usedAI === solutions.includes('ai'), 'AI状态不匹配');
   projectVersions.add(text);
  }
 }
}
assert(projectVersions.size === 900, '专业项目选择组合没有分别生成对应经历');
const forward = play().resumeProfile;
const reversed = play({ priorities:[...defaults.priorities].reverse(), 'initial-tasks':[...defaults['initial-tasks']].reverse(), 'problem-solving':[...defaults['problem-solving']].reverse() }).resumeProfile;
assert(JSON.stringify(forward) === JSON.stringify(reversed), '同一组合因点击顺序产生不同文案');
const before = JSON.stringify(store.getState().resumeProfile), growth = JSON.stringify(store.getState().growth);
store.getState().previousStep(); store.getState().nextStep();
assert(JSON.stringify(store.getState().resumeProfile) === before && JSON.stringify(store.getState().growth) === growth, '回退前进改变经历或重复累计');
store.getState().requestReset(); store.getState().confirmReset();
assert(store.getState().choiceHistory.length === 0 && store.getState().resumeProfile.projects.length === 0 && store.getState().resumeProfile.campusExperiences.length === 0, '重置未清空简历');
// The first interaction must not accept an option from another question.
store.setState({unitIndex:2,stepIndex:1});
store.getState().selectOption('invalid');
assert(store.getState().choiceHistory.length === 0, '无效选择进入简历');
store.getState().requestReset(); store.getState().confirmReset();
console.log(`通过：${sceneIds.length}页 / ${interactionCount}处互动；1600种校园组合、900种项目组合；未选内容排除、前后翻页与重置检查。`);

// Changing one answer must preserve the other six, with the same result as a
// fresh run of that path (including growth, not only text).
const replacements: Choices = {
 participation:['D'], 'campus-role':['media'], priorities:['content','publicity','interaction'],
 crisis:['A'], interest:['A'], 'initial-tasks':['research','record'], 'problem-solving':['ai','team','switch'],
};
for (const [id, answer] of Object.entries(replacements)) {
 const expected = play({[id]:answer});
 play();
 const unitIndex = course.findIndex(unit => unit.subSteps.some(step => step.id === id));
 const stepIndex = course[unitIndex].subSteps.findIndex(step => step.id === id);
 const step = course[unitIndex].subSteps[stepIndex], key = selectionKey(unitIndex, stepIndex);
 store.setState({unitIndex,stepIndex});
 const others = store.getState().choiceHistory.filter(entry => entry.interactionId !== id);
 store.getState().reopenInteraction();
 assert(!store.getState().confirmed[key] && store.getState().choiceHistory.length === 6, `改选未撤回旧记录：${id}`);
 assert(JSON.stringify(store.getState().choiceHistory) === JSON.stringify(others), `改选清除了其他答案：${id}`);
 store.getState().nextStep();
 assert(store.getState().unitIndex === unitIndex && store.getState().stepIndex === stepIndex, '未重新确认就能进入下一页');
 if (step.interaction!.type === 'multiple') {
  [...store.getState().selections[key]].forEach(value => store.getState().selectOption(value));
  store.getState().confirmInteraction();
  assert(!store.getState().confirmed[key], '未选满时允许确认');
 }
 answer.forEach(value => store.getState().selectOption(value));
 store.getState().confirmInteraction();
 store.getState().confirmInteraction();
 assert(store.getState().choiceHistory.length === 7, `重复记录：${id}`);
 assert(JSON.stringify(store.getState().resumeProfile) === JSON.stringify(expected.resumeProfile), `改选后的简历与新路径不一致：${id}`);
 assert(JSON.stringify(store.getState().growth) === JSON.stringify(expected.growth), `改选后的体验进度重复累计：${id}`);
}
store.setState({unitIndex:2,stepIndex:1,helpVisible:true});
const locked = JSON.stringify(store.getState());
store.getState().previousStep(); store.getState().nextStep(); store.getState().reopenInteraction();
store.getState().selectOption('A'); store.getState().confirmInteraction();
assert(JSON.stringify(store.getState()) === locked, '帮助弹窗打开时课程仍能被操作');
store.getState().toggleHelp();
store.getState().requestReset(); store.getState().confirmReset();
console.log('通过：7处互动改选、保留其他答案、简历与体验进度重算、重复确认以及帮助弹窗隔离。');

const finalPath = play();
assert(finalPath.growth.completedExperiences===2 && finalPath.growth.completedInteractions===7, '课堂体验进度错误');
assert(!finalPath.growth.keywords.includes('AI辅助'), '未选择AI却增加对应关键词');
assert(play({'problem-solving':['ai','team','switch']}).growth.keywords.includes('AI辅助'), 'AI选择未生成对应关键词');
const resetBefore = JSON.stringify(store.getState().resumeProfile);
store.getState().requestReset();
store.getState().nextStep(); store.getState().previousStep();
assert(JSON.stringify(store.getState().resumeProfile)===resetBefore,'请求重置就丢失简历');
store.getState().cancelReset();
assert(JSON.stringify(store.getState().resumeProfile)===resetBefore,'取消重置未保留简历');
store.getState().requestReset(); store.getState().confirmReset();
assert(store.getState().growth.keywords.length===0 && store.getState().growth.completedExperiences===0,'重置未清空课堂体验');
const finalUnit=course[course.length-1];
assert(finalUnit.year.includes('2029')&&finalUnit.title.includes('2030届'),'秋招与毕业年份不一致');
assert(course[2].remainingDays===1460-7,'入学第7天剩余天数错误');
assert(finalUnit.subSteps.filter(step=>['back-to-2026','thirty-days','ending'].includes(step.id)).every(step=>step.timeline?.remainingDays===1460&&step.timeline.year.includes('2026')),'结尾未回到2026');
console.log('通过：能力关键词、体验计数、重置保护与2026—2030时间线。');

assert(!sceneIds.includes('ending') && finalUnit.subSteps.at(-1)?.id==='thirty-days','结尾没有合并为两页');
store.getState().toggleTimer();store.getState().tick();store.getState().hideTimer();
const hiddenTime=store.getState().elapsedSeconds;store.getState().tick();
assert(store.getState().timerRunning && !store.getState().timerVisible && store.getState().elapsedSeconds===hiddenTime+1,'隐藏计时器停止了计时');
store.getState().toggleTimer();assert(store.getState().timerRunning&&store.getState().timerVisible,'显示计时器改变运行状态');
store.getState().toggleTimer();assert(!store.getState().timerRunning,'暂停计时失败');

const migratedEnding=parseProgress(JSON.stringify({version:1,courseVersion:COURSE_VERSION,unitId:'final',stepId:'ending',selections:finalPath.selections,confirmed:Object.keys(finalPath.confirmed),elapsedSeconds:20,timerVisible:false,savedAt:Date.now()}));
assert(migratedEnding?.stepId==='thirty-days','旧版结束页存档未迁移到新结束页');
console.log('通过：隐藏时持续计时、显示与暂停分离、旧版结尾存档迁移。');
