interface CrisisOutcome {
  timeline: { time: string; description: string }[];
  feedback: string;
  resume: string;
}

// One source for the scene, feedback and resume: inspection starts at 18:20
// and takes 20 minutes. Postponing the 18:30 event by 20 minutes means 18:50.
export const activityCrisis: Record<string, CrisisOutcome> = {
  A: {
    timeline: [
      { time: '18:20', description: '发现故障，安排检修' },
      { time: '18:30', description: '活动暂缓，现场等待' },
      { time: '18:40', description: '设备恢复，重新准备' },
      { time: '18:50', description: '活动开始，延后20分钟' },
    ],
    feedback: '你选择将活动推迟至18:50。设备在18:40恢复，团队重新准备后开始活动；现场等待与后续安排也需要协调。',
    resume: '设备故障时选择将活动推迟至18:50，留出检修与重新准备的时间；认识到等待与后续安排的协调需求。',
  },
  B: {
    timeline: [
      { time: '18:20', description: '发现故障，安排检修' },
      { time: '18:30', description: '没有PPT，按原流程开始' },
      { time: '18:40', description: '设备恢复，继续推进' },
    ],
    feedback: '活动18:30按时开始，团队在没有PPT的情况下推进原定环节。18:40设备恢复，前十分钟需要依靠现场表达与配合。',
    resume: '设备故障时选择18:30按原流程开始，尝试在没有PPT的条件下推进环节，直至18:40设备恢复。',
  },
  C: {
    timeline: [
      { time: '18:20', description: '调整流程，并行检修' },
      { time: '18:30', description: '先开展不依赖投影的互动' },
      { time: '18:40', description: '设备恢复，衔接后续环节' },
    ],
    feedback: '你选择调整流程，18:30先开展不依赖投影的互动，技术同学同时排查设备。18:40设备恢复，团队衔接后续环节。',
    resume: '设备故障时选择先开展不依赖投影的互动，并行排查设备；18:40设备恢复后衔接后续环节。',
  },
  D: {
    timeline: [
      { time: '18:20', description: '自己投入设备检修' },
      { time: '18:30', description: '其他任务仍需队友承接' },
      { time: '18:40', description: '设备恢复，继续协调现场' },
    ],
    feedback: '你专注于设备检修，18:40设备恢复；但18:30应开始的签到、主持与现场组织仍需要队友承接，解决设备问题并不等于完成全部任务。',
    resume: '设备故障时选择自己投入检修，18:40设备恢复；认识到签到、主持与秩序仍需其他成员同步承接。',
  },
};

export const plannedCrisisTimeline = [
  { time: '18:20', description: '投影设备出现故障' },
  { time: '18:30', description: '原定活动开始时间' },
  { time: '18:40', description: '预计完成20分钟检修' },
];
