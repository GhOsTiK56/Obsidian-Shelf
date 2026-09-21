export enum Status {
	PLANNED = 'planned',
	IN_PROGRESS = 'in_progress',
	COMPLETED = 'completed',
	DROPPED = 'dropped',
}

export interface StatusConfig {
	label: string;
	colorClass: string;
}

export const STATUS_MAP: Record<Status, StatusConfig> = {
	[Status.PLANNED]: { label: 'Planned', colorClass: 'status--planned' },
	[Status.IN_PROGRESS]: {
		label: 'In Progress',
		colorClass: 'status--in-progress',
	},
	[Status.COMPLETED]: { label: 'Completed', colorClass: 'status--completed' },
	[Status.DROPPED]: { label: 'Dropped', colorClass: 'status--dropped' },
};
