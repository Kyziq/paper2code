export const DOCKER_CONFIG = {
	CONTAINER: {
		CPP: {
			NAME: "cpp_script_runner",
			SERVICE: "cpp_runner",
		},
		JAVA: {
			NAME: "java_script_runner",
			SERVICE: "java_runner",
		},
		PYTHON: {
			NAME: "python_script_runner",
			SERVICE: "python_runner",
		},
	},
	EXECUTION: {
		TIMEOUT: 10000, // 10 seconds
		TEMP_FILE_PREFIX: "/tmp/code/",
	},
} as const;
