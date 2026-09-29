export interface InteractionOption{id:string;title:string;description?:string}
export interface Interaction{type:'single'|'multiple';prompt:string;options:InteractionOption[];maxSelections?:number;resultLogic:Record<string,string>;resumeMapping?:string}
export type SubStepType='scene'|'reveal'|'teacherTalk'|'interaction'|'result'|'summary';
export type VisualKind='words'|'roadmap'|'dorm'|'infoWall'|'activityRole'|'taskBoard'|'activityCrisis'|'activityRecap'|'campusPreview'|'lifeValues'|'challengeIntro'|'canteen'|'parking'|'radarCuriosity'|'projectIntro'|'projectTasks'|'projectProblem'|'solutionRoute'|'projectFormation'|'projectPreview'|'realityCheck'|'countdown'|'resume'|'ending'|'plain';
export interface SubStep{id:string;type:SubStepType;title:string;content:string[];visual?:VisualKind;interaction?:Interaction;speakerNotes:string;timeline?:{year:string;remainingDays:number}}
export interface Chapter{id:string;title:string;year:string;recommendedDuration:number;remainingDays:number;subSteps:SubStep[]}
export interface CourseUnit extends Chapter{kind:'opening'|'chapter'|'final'}
export interface ChoiceHistoryEntry{chapterId:string;interactionId:string;selectedOption:string[];timestamp:number;resumeMapping:string|null}

export interface StudentProfile{name:string;major:'测控技术与仪器'|'智能感知工程';campusParticipation:string|null;campusRole:string|null;activityStyle:string|null;radarInterestLevel:string|null}
export interface CampusExperience{joinedOrganization:boolean;role:string|null;priorities:string[];crisisChoice:string|null;completed:boolean}
export interface ProjectExperience{projectName:string;initialTasks:string[];challenge:string|null;problemSolvingChoices:string[];usedAI:boolean;completed:boolean}
export interface ResumeProfile{name:string;school:string;college:string;major:'测控技术与仪器'|'智能感知工程';degree:string;educationPeriod:string;jobTarget:null;gpa:null;rank:null;phone:null;email:null;skills:string[];internships:string[];projects:string[];research:string[];campusExperiences:string[];awards:string[];certificates:string[];simulationHighlights:string[];futureGoals:string[]}

export interface GrowthProgress { keywords: string[]; completedInteractions: number; totalInteractions: number; completedExperiences: number; campusCompleted: boolean; projectCompleted: boolean }
