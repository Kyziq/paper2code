interface TimestampOptions {
	showMilliseconds?: boolean;
}

export const formatTimestamp = (
	date: Date,
	options?: TimestampOptions,
): string => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	const hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	const hour12 = hours % 12 || 12;

	const timeBase = `${hour12}:${minutes}:${seconds}`;
	const timeWithMs = options?.showMilliseconds
		? `${timeBase}.${date.getMilliseconds().toString().padStart(3, "0")}`
		: timeBase;

	return `[${day}/${month}/${year} | ${timeWithMs} ${ampm}]`;
};
