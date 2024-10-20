export class ApiError extends Error {
	constructor(
		public statusCode: number,
		message: string,
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class BadRequestError extends ApiError {
	constructor(message = "Bad Request") {
		super(400, message);
	}
}

export class UnsupportedMediaTypeError extends ApiError {
	constructor(message = "Unsupported Media Type") {
		super(415, message);
	}
}

export class PayloadTooLargeError extends ApiError {
	constructor(message = "Payload Too Large") {
		super(413, message);
	}
}
