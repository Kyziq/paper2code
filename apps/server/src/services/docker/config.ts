export const DOCKER_CONFIG = {
	CONTAINER: {
		CPP: {
			NAME: "cpp-script-runner",
			SERVICE: "cpp-runner",
		},
		JAVA: {
			NAME: "java-script-runner",
			SERVICE: "java-runner",
		},
	},
	EXECUTION: {
		TIMEOUT: 60000,
		TEMP_FILE_PREFIX: "/tmp/temp",
	},
} as const;
