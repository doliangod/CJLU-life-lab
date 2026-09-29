import { activityCrisis } from '../data/activityCrisis';
import { defaultResumeProfile } from '../data/course';
import type { CampusExperience, ProjectExperience, ResumeProfile, StudentProfile } from '../types/course';

export const roleLabels: Record<string, string> = {
  planning: '活动策划成员', media: '宣传成员', execution: '现场执行成员',
  hosting: '主持互动成员', logistics: '后勤协调成员',
};

const participationActions: Record<string, string> = {
  A: '从了解校园机会开始，尝试参与新生校园体验活动。',
  B: '加入学生组织，以普通成员身份参与新生校园体验活动。',
  C: '从兴趣社团体验开始，在课堂活动情境中尝试团队协作。',
  D: '先适应学习与生活，再在课堂活动情境中尝试校园参与。',
};
const roleActions: Record<string, string> = {
  planning: '参与活动流程与互动环节设计，协助安排时间与分工。',
  media: '参与宣传内容准备、信息表达与活动素材整理。',
  execution: '协助签到、人员引导、物资确认与现场流程衔接。',
  hosting: '参与主持稿与互动流程准备，协助现场表达与环节衔接。',
  logistics: '协助确认场地、设备、物资与人员安排。',
};
const priorityActions: Record<string, string> = {
  content: '活动内容', publicity: '宣传效果', safety: '现场安全',
  interaction: '互动体验', schedule: '流程准时', materials: '物资布置',
};
const interestActions: Record<string, string> = {
  A: '从生活中的好奇出发，初步接触停车雷达感知问题。',
  B: '带着进一步了解的兴趣，探索停车雷达的专业应用。',
  C: '从主动实践的意愿出发，尝试承担雷达项目的基础任务。',
};
const taskActions: Record<string, string> = {
  research: '查阅雷达感知相关资料',
  observe: '梳理停车场实际场景',
  record: '设计测试记录表',
  collect: '设计初步测试方案',
  organize: '采集并整理实验数据',
  discuss: '参与团队方案讨论',
};
const solutionActions: Record<string, string> = {
  repeat: '重复实验确认异常能否复现',
  papers: '查阅论文和资料寻找类似问题',
  ai: '使用AI辅助整理资料、数据与可能原因',
  teacher: '请教指导老师核对理解与方法',
  team: '与队友讨论并检查模块间信息',
  switch: '重新评估题目难度与投入，提出调整研究方向的思路',
};

// Follow the course's option order so the same combination always produces the
// same copy, regardless of the order in which the learner clicks the options.
function selectedText(mapping: Record<string, string>, selected: string[], separator = '；') {
  return Object.entries(mapping).filter(([id]) => selected.includes(id)).map(([, text]) => text).join(separator);
}

export function buildResume(
  student: StudentProfile,
  campus: CampusExperience,
  project: ProjectExperience,
): ResumeProfile {
  const profile: ResumeProfile = {
    ...defaultResumeProfile, major: student.major,
    skills: [], internships: [], projects: [], research: [], campusExperiences: [],
    awards: [], certificates: [], simulationHighlights: [], futureGoals: [],
  };

  if (campus.completed) {
    profile.campusExperiences = [
      `2026级新生校园体验活动｜${roleLabels[campus.role!]}`,
      participationActions[student.campusParticipation!],
      roleActions[campus.role!],
      `资源有限时，优先保障${selectedText(priorityActions, campus.priorities, '、')}。`,
      activityCrisis[campus.crisisChoice!].resume,
    ];
    profile.simulationHighlights.push('完成一段校园活动体验');
  }

  if (project.completed) {
    profile.projects = [
      `《${project.projectName}》｜项目成员｜2027—2028`,
      interestActions[student.radarInterestLevel!],
      `初始任务：${selectedText(taskActions, project.initialTasks)}。`,
      `面对低矮障碍物感知不稳定：${selectedText(solutionActions, project.problemSolvingChoices)}。`,
      '团队阶段成果：测试结果改善，形成测试记录、数据图表与研究材料。',
    ];
    profile.awards = ['挑战杯大学生课外学术科技作品竞赛｜省赛金奖（课程情境·团队成果）'];
    profile.simulationHighlights.push('完成一段专业项目体验');
  }
  return profile;
}
