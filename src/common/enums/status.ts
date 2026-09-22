export enum Status {
	PLANNED = 'planned',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	DROPPED = 'dropped',
}

export interface StatusConfig {
	label: string;
	colorClass: string;
	emoji: string;
}

export const STATUS_MAP: Record<Status, StatusConfig> = {
	[Status.COMPLETED]: {
		label: 'Completed',
		colorClass: 'status--completed',
		emoji: '✅',
	},
	[Status.PLANNED]: {
		label: 'Planned',
		colorClass: 'status--planned',
		emoji: '📌',
	},
	[Status.IN_PROGRESS]: {
		label: 'In Progress',
		colorClass: 'status--in-progress',
		emoji: '⏳',
	},
	[Status.DROPPED]: {
		label: 'Dropped',
		colorClass: 'status--dropped',
		emoji: '❌',
	},
};
